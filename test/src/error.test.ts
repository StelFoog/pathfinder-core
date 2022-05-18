import { PireError } from '../../src';
import type { PireSendable } from '../../src/types';

describe('PireError', () => {
	test('can be created without data', () => {
		const sendable: PireSendable = { status: 'OK' };
		const error = new PireError(sendable);

		expect(error.sendable).toEqual(sendable);
		expect(error).toBeInstanceOf(PireError);
	});

	test('can be created with data', () => {
		const sendable: PireSendable = {
			status: 'Created',
			data: {
				id: 1,
				name: 'John Doe',
				posts: [
					{ id: 1, title: 'Foo', content: 'Lorem ipsum dolor' },
					{ id: 2, title: 'Bar', content: 'Dolor ipsum lorem' },
				],
			},
		};
		const error = new PireError(sendable);

		expect(error.sendable).toEqual(sendable);
		expect(error).toBeInstanceOf(PireError);
	});
});
