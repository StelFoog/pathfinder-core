import { HttpMethod, HttpStatus } from '../http';
import { PireMethodPrimer, PirePrimedParams } from './primer';
export declare type Json = string | number | boolean | null | Json[] | {
    [key: string]: Json;
};
export declare type Asyncable<T> = Promise<T> | T;
export declare type PireParams = {
    query: Record<string, string | string[]>;
    params: Record<string, string>;
    body: Json;
    headers: Record<string, string>;
    method: HttpMethod;
    path: string;
    primed: PirePrimedParams;
};
export declare type PireSendable = {
    data?: any;
    status: HttpStatus;
};
export declare type PireMethod = {
    fn: (params: PireParams) => Asyncable<PireSendable>;
    primers?: PireMethodPrimer[];
    excludePrimers?: string | string[];
} | {
    (params: PireParams): Asyncable<PireSendable>;
    primers?: PireMethodPrimer[];
    excludePrimers?: string | string[];
};
