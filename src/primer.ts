import { join } from 'path';

import { cleanPath } from './path';
import PireError from './error';
import type {
	BodyFilterBuilderParams,
	BodyFilterBuilderConfig,
	HttpMethod,
	Json,
	PireMethodPrimer,
	PirePrimer,
	PirePrimerFunction,
} from './types';

/**
 * Converts method primers to primers in object syntax
 * @param primers
 * @returns
 */
export function objectifyLocalPrimers(primers: PireMethodPrimer[] = []): PirePrimer[] {
	return primers.map((p) => ({
		fn: typeof p === 'function' ? p.bind({}) : p.fn,
		cleanup: p.cleanup,
	}));
}

/**
 * Prepares the given primers for use by building paths for includes and excludes and
 * converting function form primers to standard form primers
 * @param primers to prepare
 * @param path where the primers were given
 * @returns prepared primers
 */
export function preparePrimers(
	primers: (PirePrimer | PirePrimerFunction)[],
	path: string
): PirePrimer[] {
	return primers.map((p) => ({
		fn: typeof p === 'function' ? p.bind({}) : p.fn,
		cleanup: p.cleanup,
		includes:
			p.includes &&
			p.includes.map((v) => ({
				path: cleanPath(v.path.charAt(0) === '.' ? join(path, v.path) : v.path),
				methods: v.methods,
			})),
		excludes:
			p.excludes &&
			p.excludes.map((v) => ({
				path: cleanPath(v.path.charAt(0) === '.' ? join(path, v.path) : v.path),
				methods: v.methods,
			})),
		id: p.id || (typeof p === 'function' ? p.name : undefined),
	}));
}

/**
 * Filters primers for a specific path and method
 * @param primers filter from
 * @param path
 * @param method
 * @returns filtered primers
 */
export function primersBuilder(
	primers: PirePrimer[],
	path: string,
	method: HttpMethod,
	excludePrimers: string[]
): PirePrimer[] {
	const arr: PirePrimer[] = [];
	const ids: Record<string, true> = {};

	primers.forEach((p) => {
		// IDs must be unique
		if (p.id) {
			if (ids[p.id]) {
				throw `Multiple primers found in the same context with the id '${p.id}'`;
			}
			ids[p.id] = true;
		}
		// Filter ids
		if (
			(p.id && excludePrimers.includes(p.id)) ||
			(p.excludes &&
				p.excludes.some((v) => {
					return (
						(v.methods === 'ALL' || v.methods === method || v.methods.includes(method)) &&
						v.path === path
					);
				}))
		) {
			return;
		}

		if (p.includes) {
			if (
				p.includes.some((v) => {
					return (
						(v.methods === 'ALL' || v.methods === method || v.methods.includes(method)) &&
						v.path === path
					);
				})
			)
				return arr.push(p);
		} else {
			arr.push(p);
		}
	});

	return arr;
}

/**
 * Converts list of missing properties to human intelligable string
 */
export function stringifyMissingList(list: string[]): string {
	const last = list.pop();
	if (!list.length) return last;
	return `${list.join(', ')} and ${last}`;
}

/**
 * Creates a primer that adds a filtered version of body to params.primed
 * @param params.permitted list of permitted properties on body
 * @param params.required list of required properties on body, all elements are automatically
 * set as permitted
 * @param params.defaults object containing default values to set for properties on body, all
 * properties on `defaults` are automatically set as permitted
 * @param config.missingRequiredSendable custom sendable for in case a required property is missing
 * from body
 * @param config.bodyNotObjectSendable custom sendable for in case body isn't a processable object
 * @returns body filter primer
 */
export function bodyFilterBuilder(
	params: BodyFilterBuilderParams,
	config: BodyFilterBuilderConfig = {}
): PireMethodPrimer {
	const { permitted = [], required = [], defaults = {} } = params;
	const {
		missingRequiredSendable = {
			status: 'Unprocessable Entity',
			data: 'Missing required fields from body: {{missingRequiredFields}}',
		},
		bodyNotObjectSendable = { status: 'Unprocessable Entity', data: 'Invalid body' },
	} = config;

	const defaultKeys = Object.keys(defaults);
	const filter = [...permitted, ...required, ...defaultKeys];
	return {
		fn: (params) => {
			if (typeof params.body !== 'object' || params.body instanceof Array)
				throw new PireError(bodyNotObjectSendable);
			// All required properties present
			const missingRequiredFields = [];
			required.forEach((req) => {
				if (typeof params.body[req] === 'undefined') missingRequiredFields.push(req);
			});
			if (missingRequiredFields.length)
				throw new PireError({
					status: missingRequiredSendable.status,
					data:
						typeof missingRequiredSendable.data === 'string'
							? missingRequiredSendable.data.replace(
									'{{missingRequiredFields}}',
									stringifyMissingList(missingRequiredFields)
							  )
							: missingRequiredSendable.data,
				});
			// Exclude all unfiltered parameters
			const result: Record<string, Json> = {};
			filter.forEach((f) => {
				if (typeof params.body[f] !== 'undefined') result[f] = params.body[f];
			});
			// Set defaults
			defaultKeys.forEach((def) => {
				if (result[def] === undefined) {
					const value = defaults[def];
					if (typeof value === 'function') result[def] = value(params);
					else result[def] = value;
				}
			});

			return { primed: { ...params.primed, body: result } };
		},
	};
}
