import { HttpMethod, HttpStatus } from '../http';
import { PireMethodPrimer, PirePrimedParams, PirePrimerOnly } from './primer';

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export type Asyncable<T> = Promise<T> | T;

export type PireParams = {
	query: Record<string, string | string[]>;
	params: Record<string, string>;
	body: Json;
	headers: Record<string, string>;
	method: HttpMethod;
	path: string;
	primed: PirePrimedParams;
};

export type PireSendable = {
	data?: any;
	status: HttpStatus;
};
export type PireMethod =
	| {
			fn: (params: PireParams) => Asyncable<PireSendable>;
			primers?: PireMethodPrimer[];
			excludePrimers?: string | string[];
	  }
	| {
			(params: PireParams): Asyncable<PireSendable>;
			primers?: PireMethodPrimer[];
			excludePrimers?: string | string[];
	  };
