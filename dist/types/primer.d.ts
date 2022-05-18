import type { HttpMethod } from '../http';
import type { Asyncable, Json, PireParams, PireSendable } from './general';
export declare type PirePrimedParams = Record<string, any>;
export declare type PirePrimerParams = PireParams & {
    primerOnly: PirePrimerOnly;
};
export declare type PirePrimerOnly = Record<string, any>;
export declare type PirePrimerSpecifier = {
    path: string;
    methods: HttpMethod[] | 'ALL' | HttpMethod;
};
export declare type PirePrimerResult = Partial<Omit<PirePrimerParams, 'query' | 'params' | 'body' | 'headers' | 'method' | 'path'>>;
export declare type PirePrimerMethod = (params: PirePrimerParams) => Asyncable<PirePrimerResult | void>;
export interface PirePrimerFunction {
    (params: PirePrimerParams): Asyncable<PirePrimerResult | void>;
    cleanup?: PirePrimerMethod;
    excludes?: PirePrimerSpecifier[];
    includes?: PirePrimerSpecifier[];
    id?: string;
}
export declare type PirePrimer = {
    fn?: PirePrimerMethod;
    cleanup?: PirePrimerMethod;
    excludes?: PirePrimerSpecifier[];
    includes?: PirePrimerSpecifier[];
    id?: string;
};
export declare type PireMethodPrimer = {
    fn?: (params: PirePrimerParams) => Asyncable<PirePrimerResult | void>;
    cleanup?: PirePrimerMethod;
} | {
    (params: PirePrimerParams): Asyncable<PirePrimerResult | void>;
    cleanup?: PirePrimerMethod;
};
export declare type BodyFilterBuilderParams = {
    permitted?: string[];
    required?: string[];
    defaults?: Record<string, BodyFilterDefaultsFunction | Json>;
};
export declare type BodyFilterBuilderConfig = {
    missingRequiredSendable?: PireSendable;
    bodyNotObjectSendable?: PireSendable;
};
export declare type BodyFilterDefaultsFunction = (params: PirePrimerParams) => Json;
