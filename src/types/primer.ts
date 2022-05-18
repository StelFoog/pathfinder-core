import type { HttpMethod } from '../http';
import type { Asyncable, Json, PireParams, PireSendable } from './general';

export type PirePrimedParams = Record<string, any>;

export type PirePrimerParams = PireParams & { primerOnly: PirePrimerOnly };
export type PirePrimerOnly = Record<string, any>;

export type PirePrimerSpecifier = {
	path: string;
	methods: HttpMethod[] | 'ALL' | HttpMethod;
};

export type PirePrimerResult = Partial<
	Omit<PirePrimerParams, 'query' | 'params' | 'body' | 'headers' | 'method' | 'path'>
>;

export type PirePrimerMethod = (params: PirePrimerParams) => Asyncable<PirePrimerResult | void>;

export interface PirePrimerFunction {
	(params: PirePrimerParams): Asyncable<PirePrimerResult | void>;
	cleanup?: PirePrimerMethod;
	excludes?: PirePrimerSpecifier[];
	includes?: PirePrimerSpecifier[];
	id?: string;
}
export type PirePrimer = {
	fn?: PirePrimerMethod;
	cleanup?: PirePrimerMethod;
	excludes?: PirePrimerSpecifier[];
	includes?: PirePrimerSpecifier[];
	id?: string;
};

export type PireMethodPrimer =
	| {
			fn?: (params: PirePrimerParams) => Asyncable<PirePrimerResult | void>;
			cleanup?: PirePrimerMethod;
	  }
	| {
			(params: PirePrimerParams): Asyncable<PirePrimerResult | void>;
			cleanup?: PirePrimerMethod;
	  };

// Body filter

export type BodyFilterBuilderParams = {
	permitted?: string[];
	required?: string[];
	defaults?: Record<string, BodyFilterDefaultsFunction | Json>;
};

export type BodyFilterBuilderConfig = {
	missingRequiredSendable?: PireSendable;
	bodyNotObjectSendable?: PireSendable;
};

export type BodyFilterDefaultsFunction = (params: PirePrimerParams) => Json;
