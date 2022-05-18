import {
	bodyFilterBuilder,
	objectifyLocalPrimers,
	PireError,
	preparePrimers,
	primersBuilder,
} from '../../src';
import { stringifyMissingList } from '../../src/primer';
import type {
	BodyFilterBuilderParams,
	PireMethodPrimer,
	PirePrimer,
	PirePrimerFunction,
	PirePrimerParams,
	PirePrimerResult,
	PireSendable,
} from '../../src/types';

const defaultPrimerParams: PirePrimerParams = {
	query: {},
	body: {},
	params: {},
	headers: {},
	method: 'GET',
	path: '',
	primed: {},
	primerOnly: {},
};
const primerReturn: PirePrimerResult = { primed: { fn: 'primed' } };
const primerCleanupReturn: PirePrimerResult = { primed: { cleanup: 'primed' } };

describe('objectifyLocalPrimers', () => {
	test('converts function syntax local primer to object syntax primer', () => {
		const localPrimer: PireMethodPrimer = () => primerReturn;
		localPrimer.cleanup = () => primerCleanupReturn;

		const [primer] = objectifyLocalPrimers([localPrimer]);
		expect(primer.fn(defaultPrimerParams)).toEqual(primerReturn);
		expect(primer.cleanup(defaultPrimerParams)).toEqual(primerCleanupReturn);
	});

	test('converts object syntax local primer to object syntax primer', () => {
		const localPrimer: PireMethodPrimer = {
			fn: () => primerReturn,
			cleanup: () => primerCleanupReturn,
		};

		const [primer] = objectifyLocalPrimers([localPrimer]);
		expect(primer.fn(defaultPrimerParams)).toEqual(primerReturn);
		expect(primer.cleanup(defaultPrimerParams)).toEqual(primerCleanupReturn);
	});

	test('undefined returns empty array', () => {
		expect(objectifyLocalPrimers(undefined)).toEqual([]);
	});
});

describe('preparePrimers', () => {
	test('converts function syntax primer to object syntax primer', () => {
		const functionPrimer: PirePrimerFunction = () => primerReturn;
		functionPrimer.cleanup = () => primerCleanupReturn;

		const [primer] = preparePrimers([functionPrimer], '/');
		expect(primer.fn(defaultPrimerParams)).toEqual(primerReturn);
		expect(primer.cleanup(defaultPrimerParams)).toEqual(primerCleanupReturn);
		expect(primer.includes).toBeUndefined();
		expect(primer.excludes).toBeUndefined();
		expect(primer.id).toBe('functionPrimer');
	});

	test('object syntax primer remains the same', () => {
		const functionPrimer: PirePrimer = {
			fn: () => primerReturn,
			cleanup: () => primerCleanupReturn,
		};

		const [primer] = preparePrimers([functionPrimer], '/');
		expect(primer.fn(defaultPrimerParams)).toEqual(primerReturn);
		expect(primer.cleanup(defaultPrimerParams)).toEqual(primerCleanupReturn);
		expect(primer.includes).toBeUndefined();
		expect(primer.excludes).toBeUndefined();
		expect(primer.id).toBeUndefined();
	});

	test('with id', () => {
		const id = 'foobar';
		const functionPrimer: PirePrimer = {
			fn: () => primerReturn,
			cleanup: () => primerCleanupReturn,
			id,
		};

		const [primer] = preparePrimers([functionPrimer], '/');
		expect(primer.fn(defaultPrimerParams)).toEqual(primerReturn);
		expect(primer.cleanup(defaultPrimerParams)).toEqual(primerCleanupReturn);
		expect(primer.includes).toBeUndefined();
		expect(primer.excludes).toBeUndefined();
		expect(primer.id).toBe(id);
	});

	test('with includes', () => {
		const includes: PirePrimer['includes'] = [{ methods: 'ALL', path: '/' }];
		const functionPrimer: PirePrimer = {
			fn: () => primerReturn,
			cleanup: () => primerCleanupReturn,
			includes,
		};

		const [primer] = preparePrimers([functionPrimer], '/');
		expect(primer.fn(defaultPrimerParams)).toEqual(primerReturn);
		expect(primer.cleanup(defaultPrimerParams)).toEqual(primerCleanupReturn);
		expect(primer.includes).toEqual(includes);
		expect(primer.excludes).toBeUndefined();
		expect(primer.id).toBeUndefined();
	});

	test('with excludes', () => {
		const excludes: PirePrimer['excludes'] = [{ methods: 'ALL', path: '/' }];
		const functionPrimer: PirePrimer = {
			fn: () => primerReturn,
			cleanup: () => primerCleanupReturn,
			excludes,
		};

		const [primer] = preparePrimers([functionPrimer], '/');
		expect(primer.fn(defaultPrimerParams)).toEqual(primerReturn);
		expect(primer.cleanup(defaultPrimerParams)).toEqual(primerCleanupReturn);
		expect(primer.includes).toBeUndefined();
		expect(primer.excludes).toEqual(excludes);
		expect(primer.id).toBeUndefined();
	});

	test('relative path is converted properly', () => {
		const includes: PirePrimer['includes'] = [{ methods: 'ALL', path: './includes' }];
		const excludes: PirePrimer['excludes'] = [{ methods: 'ALL', path: './excludes' }];
		const functionPrimer: PirePrimer = {
			excludes,
			includes,
		};

		const [primer] = preparePrimers([functionPrimer], '/relative');
		expect(primer.fn).toBeUndefined();
		expect(primer.cleanup).toBeUndefined();
		expect(primer.includes).toEqual([
			{ methods: 'ALL', path: '/relative/includes' },
		] as PirePrimer['includes']);
		expect(primer.excludes).toEqual([
			{ methods: 'ALL', path: '/relative/excludes' },
		] as PirePrimer['excludes']);
		expect(primer.id).toBeUndefined();
	});
});

describe('primersBuilder', () => {
	test('no excludes or includes returns same list', () => {
		const primers: PirePrimer[] = [
			{ fn: () => primerReturn, id: 'prime' },
			{ cleanup: () => primerCleanupReturn, id: 'clean' },
		];

		const builtPrimers = primersBuilder(primers, '/', 'GET', []);

		expect(builtPrimers.length).toEqual(primers.length);
		builtPrimers.forEach((built, i) => {
			const primer = primers[i];

			expect(typeof built).toBe(typeof primer);
			if (primer.fn === undefined) expect(built.fn).toBeUndefined();
			else expect(built.fn(defaultPrimerParams)).toEqual(primer.fn(defaultPrimerParams));
			if (primer.cleanup === undefined) expect(built.cleanup).toBeUndefined();
			else expect(built.cleanup(defaultPrimerParams)).toEqual(primer.cleanup(defaultPrimerParams));
			expect(built.includes).toEqual(primer.includes);
			expect(built.excludes).toEqual(primer.excludes);
			expect(built.id).toEqual(primer.id);
		});
	});

	test('filtered based on ids', () => {
		const primers: PirePrimer[] = [
			{ fn: () => primerReturn, id: 'prime' },
			{ cleanup: () => primerCleanupReturn, id: 'clean' },
		];

		const filteredPrimers = [primers[0]];
		const builtPrimers = primersBuilder(primers, '/', 'GET', ['clean']);

		expect(builtPrimers.length).toEqual(filteredPrimers.length);
		builtPrimers.forEach((built, i) => {
			const primer = filteredPrimers[i];

			expect(typeof built).toBe(typeof primer);
			if (primer.fn === undefined) expect(built.fn).toBeUndefined();
			else expect(built.fn(defaultPrimerParams)).toEqual(primer.fn(defaultPrimerParams));
			if (primer.cleanup === undefined) expect(built.cleanup).toBeUndefined();
			else expect(built.cleanup(defaultPrimerParams)).toEqual(primer.cleanup(defaultPrimerParams));
			expect(built.includes).toEqual(primer.includes);
			expect(built.excludes).toEqual(primer.excludes);
			expect(built.id).toEqual(primer.id);
		});
	});
	test('dupicate ids throws error', () => {
		const primers: PirePrimer[] = [
			{ fn: () => primerReturn, id: 'foo' },
			{ cleanup: () => primerCleanupReturn, id: 'foo' },
		];

		expect(() => primersBuilder(primers, '/', 'GET', [])).toThrow(
			`Multiple primers found in the same context with the id '${primers[0].id}'`
		);
	});

	test('filter based on exludes methods="ALL"', () => {
		const primers: PirePrimer[] = [
			{ fn: () => primerReturn, id: 'prime' },
			{ cleanup: () => primerCleanupReturn, excludes: [{ methods: 'ALL', path: '/foo' }] },
		];

		const filteredPrimers = [primers[0]];
		const builtPrimers = primersBuilder(primers, '/foo', 'GET', []);

		expect(builtPrimers.length).toEqual(filteredPrimers.length);
		builtPrimers.forEach((built, i) => {
			const primer = filteredPrimers[i];

			expect(typeof built).toBe(typeof primer);
			if (primer.fn === undefined) expect(built.fn).toBeUndefined();
			else expect(built.fn(defaultPrimerParams)).toEqual(primer.fn(defaultPrimerParams));
			if (primer.cleanup === undefined) expect(built.cleanup).toBeUndefined();
			else expect(built.cleanup(defaultPrimerParams)).toEqual(primer.cleanup(defaultPrimerParams));
			expect(built.includes).toEqual(primer.includes);
			expect(built.excludes).toEqual(primer.excludes);
			expect(built.id).toEqual(primer.id);
		});
	});
	test('filter based on exludes methods="GET"', () => {
		const primers: PirePrimer[] = [
			{ fn: () => primerReturn, id: 'prime' },
			{ cleanup: () => primerCleanupReturn, excludes: [{ methods: 'GET', path: '/foo' }] },
		];

		const filteredPrimers = [primers[0]];
		const builtPrimers = primersBuilder(primers, '/foo', 'GET', []);

		expect(builtPrimers.length).toEqual(filteredPrimers.length);
		builtPrimers.forEach((built, i) => {
			const primer = filteredPrimers[i];

			expect(typeof built).toBe(typeof primer);
			if (primer.fn === undefined) expect(built.fn).toBeUndefined();
			else expect(built.fn(defaultPrimerParams)).toEqual(primer.fn(defaultPrimerParams));
			if (primer.cleanup === undefined) expect(built.cleanup).toBeUndefined();
			else expect(built.cleanup(defaultPrimerParams)).toEqual(primer.cleanup(defaultPrimerParams));
			expect(built.includes).toEqual(primer.includes);
			expect(built.excludes).toEqual(primer.excludes);
			expect(built.id).toEqual(primer.id);
		});
	});
	test('filter based on exludes methods="[GET]"', () => {
		const primers: PirePrimer[] = [
			{ fn: () => primerReturn, id: 'prime' },
			{ cleanup: () => primerCleanupReturn, excludes: [{ methods: ['GET'], path: '/foo' }] },
		];

		const filteredPrimers = [primers[0]];
		const builtPrimers = primersBuilder(primers, '/foo', 'GET', []);

		expect(builtPrimers.length).toEqual(filteredPrimers.length);
		builtPrimers.forEach((built, i) => {
			const primer = filteredPrimers[i];

			expect(typeof built).toBe(typeof primer);
			if (primer.fn === undefined) expect(built.fn).toBeUndefined();
			else expect(built.fn(defaultPrimerParams)).toEqual(primer.fn(defaultPrimerParams));
			if (primer.cleanup === undefined) expect(built.cleanup).toBeUndefined();
			else expect(built.cleanup(defaultPrimerParams)).toEqual(primer.cleanup(defaultPrimerParams));
			expect(built.includes).toEqual(primer.includes);
			expect(built.excludes).toEqual(primer.excludes);
			expect(built.id).toEqual(primer.id);
		});
	});
	test('doesn\'t exlude on excludes methods="POST" when method is "GET"', () => {
		const primers: PirePrimer[] = [
			{ fn: () => primerReturn, id: 'prime' },
			{ cleanup: () => primerCleanupReturn, excludes: [{ methods: 'POST', path: '/foo' }] },
		];

		const builtPrimers = primersBuilder(primers, '/foo', 'GET', []);

		expect(builtPrimers.length).toEqual(primers.length);
		builtPrimers.forEach((built, i) => {
			const primer = primers[i];

			expect(typeof built).toBe(typeof primer);
			if (primer.fn === undefined) expect(built.fn).toBeUndefined();
			else expect(built.fn(defaultPrimerParams)).toEqual(primer.fn(defaultPrimerParams));
			if (primer.cleanup === undefined) expect(built.cleanup).toBeUndefined();
			else expect(built.cleanup(defaultPrimerParams)).toEqual(primer.cleanup(defaultPrimerParams));
			expect(built.includes).toEqual(primer.includes);
			expect(built.excludes).toEqual(primer.excludes);
			expect(built.id).toEqual(primer.id);
		});
	});
	test('doesn\'t exlude on excludes methods="[POST]" when method is "GET"', () => {
		const primers: PirePrimer[] = [
			{ fn: () => primerReturn, id: 'prime' },
			{ cleanup: () => primerCleanupReturn, excludes: [{ methods: ['POST'], path: '/foo' }] },
		];

		const builtPrimers = primersBuilder(primers, '/foo', 'GET', []);

		expect(builtPrimers.length).toEqual(primers.length);
		builtPrimers.forEach((built, i) => {
			const primer = primers[i];

			expect(typeof built).toBe(typeof primer);
			if (primer.fn === undefined) expect(built.fn).toBeUndefined();
			else expect(built.fn(defaultPrimerParams)).toEqual(primer.fn(defaultPrimerParams));
			if (primer.cleanup === undefined) expect(built.cleanup).toBeUndefined();
			else expect(built.cleanup(defaultPrimerParams)).toEqual(primer.cleanup(defaultPrimerParams));
			expect(built.includes).toEqual(primer.includes);
			expect(built.excludes).toEqual(primer.excludes);
			expect(built.id).toEqual(primer.id);
		});
	});

	test('filters based on includes where methods="ALL"', () => {
		const primers: PirePrimer[] = [
			{ fn: () => primerReturn },
			{ cleanup: () => primerCleanupReturn, includes: [{ methods: 'ALL', path: '/foo' }] },
		];

		const filteredPrimers = [primers[0]];
		const builtPrimers = primersBuilder(primers, '/bar', 'GET', []);

		expect(builtPrimers.length).toEqual(filteredPrimers.length);
		builtPrimers.forEach((built, i) => {
			const primer = filteredPrimers[i];

			expect(typeof built).toBe(typeof primer);
			if (primer.fn === undefined) expect(built.fn).toBeUndefined();
			else expect(built.fn(defaultPrimerParams)).toEqual(primer.fn(defaultPrimerParams));
			if (primer.cleanup === undefined) expect(built.cleanup).toBeUndefined();
			else expect(built.cleanup(defaultPrimerParams)).toEqual(primer.cleanup(defaultPrimerParams));
			expect(built.includes).toEqual(primer.includes);
			expect(built.excludes).toEqual(primer.excludes);
			expect(built.id).toEqual(primer.id);
		});
	});
	test('filters based on includes where methods="GET"', () => {
		const primers: PirePrimer[] = [
			{ fn: () => primerReturn },
			{ cleanup: () => primerCleanupReturn, includes: [{ methods: 'GET', path: '/foo' }] },
		];

		const filteredPrimers = [primers[0]];
		const builtPrimers = primersBuilder(primers, '/bar', 'GET', []);

		expect(builtPrimers.length).toEqual(filteredPrimers.length);
		builtPrimers.forEach((built, i) => {
			const primer = filteredPrimers[i];

			expect(typeof built).toBe(typeof primer);
			if (primer.fn === undefined) expect(built.fn).toBeUndefined();
			else expect(built.fn(defaultPrimerParams)).toEqual(primer.fn(defaultPrimerParams));
			if (primer.cleanup === undefined) expect(built.cleanup).toBeUndefined();
			else expect(built.cleanup(defaultPrimerParams)).toEqual(primer.cleanup(defaultPrimerParams));
			expect(built.includes).toEqual(primer.includes);
			expect(built.excludes).toEqual(primer.excludes);
			expect(built.id).toEqual(primer.id);
		});
	});
	test('filters based on includes where methods="[GET]"', () => {
		const primers: PirePrimer[] = [
			{ fn: () => primerReturn },
			{ cleanup: () => primerCleanupReturn, includes: [{ methods: ['GET'], path: '/foo' }] },
		];

		const filteredPrimers = [primers[0]];
		const builtPrimers = primersBuilder(primers, '/bar', 'GET', []);

		expect(builtPrimers.length).toEqual(filteredPrimers.length);
		builtPrimers.forEach((built, i) => {
			const primer = filteredPrimers[i];

			expect(typeof built).toBe(typeof primer);
			if (primer.fn === undefined) expect(built.fn).toBeUndefined();
			else expect(built.fn(defaultPrimerParams)).toEqual(primer.fn(defaultPrimerParams));
			if (primer.cleanup === undefined) expect(built.cleanup).toBeUndefined();
			else expect(built.cleanup(defaultPrimerParams)).toEqual(primer.cleanup(defaultPrimerParams));
			expect(built.includes).toEqual(primer.includes);
			expect(built.excludes).toEqual(primer.excludes);
			expect(built.id).toEqual(primer.id);
		});
	});
	test('doesn\'t filter on includes methods="ALL"', () => {
		const primers: PirePrimer[] = [
			{ fn: () => primerReturn, id: 'prime' },
			{ cleanup: () => primerCleanupReturn, includes: [{ methods: 'ALL', path: '/foo' }] },
		];

		const builtPrimers = primersBuilder(primers, '/foo', 'GET', []);

		expect(builtPrimers.length).toEqual(primers.length);
		builtPrimers.forEach((built, i) => {
			const primer = primers[i];

			expect(typeof built).toBe(typeof primer);
			if (primer.fn === undefined) expect(built.fn).toBeUndefined();
			else expect(built.fn(defaultPrimerParams)).toEqual(primer.fn(defaultPrimerParams));
			if (primer.cleanup === undefined) expect(built.cleanup).toBeUndefined();
			else expect(built.cleanup(defaultPrimerParams)).toEqual(primer.cleanup(defaultPrimerParams));
			expect(built.includes).toEqual(primer.includes);
			expect(built.excludes).toEqual(primer.excludes);
			expect(built.id).toEqual(primer.id);
		});
	});
	test('doesn\'t filter out on include methods="POST" when method is "GET"', () => {
		const primers: PirePrimer[] = [
			{ fn: () => primerReturn },
			{ cleanup: () => primerCleanupReturn, includes: [{ methods: 'POST', path: '/foo' }] },
		];

		const filteredPrimers = [primers[0]];
		const builtPrimers = primersBuilder(primers, '/bar', 'GET', []);

		expect(builtPrimers.length).toEqual(filteredPrimers.length);
		builtPrimers.forEach((built, i) => {
			const primer = filteredPrimers[i];

			expect(typeof built).toBe(typeof primer);
			if (primer.fn === undefined) expect(built.fn).toBeUndefined();
			else expect(built.fn(defaultPrimerParams)).toEqual(primer.fn(defaultPrimerParams));
			if (primer.cleanup === undefined) expect(built.cleanup).toBeUndefined();
			else expect(built.cleanup(defaultPrimerParams)).toEqual(primer.cleanup(defaultPrimerParams));
			expect(built.includes).toEqual(primer.includes);
			expect(built.excludes).toEqual(primer.excludes);
			expect(built.id).toEqual(primer.id);
		});
	});
	test('doesn\'t filter out on include methods="[POST]" when method is "GET"', () => {
		const primers: PirePrimer[] = [
			{ fn: () => primerReturn },
			{ cleanup: () => primerCleanupReturn, includes: [{ methods: ['POST'], path: '/foo' }] },
		];

		const filteredPrimers = [primers[0]];
		const builtPrimers = primersBuilder(primers, '/bar', 'GET', []);

		expect(builtPrimers.length).toEqual(filteredPrimers.length);
		builtPrimers.forEach((built, i) => {
			const primer = filteredPrimers[i];

			expect(typeof built).toBe(typeof primer);
			if (primer.fn === undefined) expect(built.fn).toBeUndefined();
			else expect(built.fn(defaultPrimerParams)).toEqual(primer.fn(defaultPrimerParams));
			if (primer.cleanup === undefined) expect(built.cleanup).toBeUndefined();
			else expect(built.cleanup(defaultPrimerParams)).toEqual(primer.cleanup(defaultPrimerParams));
			expect(built.includes).toEqual(primer.includes);
			expect(built.excludes).toEqual(primer.excludes);
			expect(built.id).toEqual(primer.id);
		});
	});
});

describe('stringifyMissingList', () => {
	test('one element', () => {
		expect(stringifyMissingList(['foo'])).toBe('foo');
	});

	test('two elements', () => {
		expect(stringifyMissingList(['foo', 'bar'])).toBe('foo and bar');
	});

	test('three elements', () => {
		expect(stringifyMissingList(['foo', 'bar', 'baz'])).toBe('foo, bar and baz');
	});
});

describe('bodyFilterBuilder', () => {
	test('filteres out body properties', async () => {
		const body = { foo: 'foo', bar: {}, baz: 0, zot: ['zot'] };
		const primerParams: PirePrimerParams = { ...defaultPrimerParams, body };

		const bodyFilter = bodyFilterBuilder({
			permitted: ['foo', 'bar', 'zot', 'bat'],
		}) as PirePrimer;
		const filtered = (await bodyFilter.fn(primerParams)) as {
			primed: { body: Record<string, any> };
		};
		const filteredBody = filtered.primed.body;

		expect(filteredBody.foo).toBe(body.foo);
		expect(filteredBody.bar).toEqual(body.bar);
		expect(filteredBody.baz).toBeUndefined();
		expect(filteredBody.zot).toEqual(body.zot);
		expect(filteredBody.bat).toBeUndefined();
	});

	test('filteres out body properties based on required', async () => {
		const body = { foo: 'foo', bar: {}, baz: 0, zot: ['zot'] };
		const primerParams: PirePrimerParams = { ...defaultPrimerParams, body };

		const bodyFilter = bodyFilterBuilder({
			permitted: ['foo', 'bat'],
			required: ['bar', 'zot'],
		}) as PirePrimer;
		const filtered = (await bodyFilter.fn(primerParams)) as {
			primed: { body: Record<string, any> };
		};
		const filteredBody = filtered.primed.body;

		expect(filteredBody.foo).toBe(body.foo);
		expect(filteredBody.bar).toEqual(body.bar);
		expect(filteredBody.baz).toBeUndefined();
		expect(filteredBody.zot).toEqual(body.zot);
		expect(filteredBody.bat).toBeUndefined();
	});

	test('missing required property throws error', async () => {
		const body = { foo: 'foo', baz: 0, zot: ['zot'] };
		const primerParams: PirePrimerParams = { ...defaultPrimerParams, body };

		const bodyFilter = bodyFilterBuilder({
			permitted: ['foo', 'bat'],
			required: ['bar', 'zot'],
		}) as PirePrimer;
		expect(() => bodyFilter.fn(primerParams)).toThrow(PireError);
	});

	test("body isn't object throws error", async () => {
		const body = 'body';
		const primerParams: PirePrimerParams = { ...defaultPrimerParams, body };

		const bodyFilter = bodyFilterBuilder({
			permitted: ['foo', 'bar', 'zot', 'bat'],
		}) as PirePrimer;
		expect(() => bodyFilter.fn(primerParams)).toThrow(PireError);
	});

	test('body is array throws error', async () => {
		const body = ['body'];
		const primerParams: PirePrimerParams = { ...defaultPrimerParams, body };

		const bodyFilter = bodyFilterBuilder({
			permitted: ['foo', 'bar', 'zot', 'bat'],
		}) as PirePrimer;
		expect(() => bodyFilter.fn(primerParams)).toThrow(PireError);
	});

	test('defaults are set', async () => {
		const body: PirePrimerParams['body'] = { foo: 'foo', bar: {} };
		const primed: PirePrimerParams['primed'] = { user: { id: 1, name: 'Bat' } };
		const primerParams: PirePrimerParams = { ...defaultPrimerParams, body, primed };

		const defaults: BodyFilterBuilderParams['defaults'] = {
			foo: 400,
			zot: ['zot'],
			bat: ({ primed }) => primed.user,
		};
		const bodyFilter = bodyFilterBuilder({
			defaults,
		}) as PirePrimer;
		const filtered = (await bodyFilter.fn(primerParams)) as {
			primed: { body: Record<string, any> };
		};
		const filteredBody = filtered.primed.body;

		expect(filteredBody.foo).toBe(body.foo);
		expect(filteredBody.bar).toBeUndefined();
		expect(filteredBody.zot).toBe(defaults.zot);
		expect(filteredBody.bat).toBe(primed.user);
	});

	test('configured missingRequiredSendable', () => {
		const body = { foo: 'foo', baz: 0, zot: ['zot'] };
		const primerParams: PirePrimerParams = { ...defaultPrimerParams, body };
		const missingRequiredSendable: PireSendable = { status: 'Bad Request', data: 400 };

		const bodyFilter = bodyFilterBuilder(
			{
				permitted: ['foo', 'bat'],
				required: ['bar', 'zot'],
			},
			{ missingRequiredSendable }
		) as PirePrimer;

		let error: PireError;
		try {
			bodyFilter.fn(primerParams);
		} catch (e) {
			error = e;
		}
		expect(error).toBeInstanceOf(PireError);
		expect(error.sendable).toEqual(missingRequiredSendable);
	});

	test('configured bodyNotObjectSendable', () => {
		const body = 'string';
		const primerParams: PirePrimerParams = { ...defaultPrimerParams, body };
		const bodyNotObjectSendable: PireSendable = { status: 'Expectation Failed' };

		const bodyFilter = bodyFilterBuilder(
			{
				permitted: ['foo', 'bat'],
				required: ['bar', 'zot'],
			},
			{ bodyNotObjectSendable }
		) as PirePrimer;

		let error: PireError;
		try {
			bodyFilter.fn(primerParams);
		} catch (e) {
			error = e;
		}
		expect(error).toBeInstanceOf(PireError);
		expect(error.sendable).toEqual(bodyNotObjectSendable);
	});
});
