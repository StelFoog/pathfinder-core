import type { HttpMethod } from '../http';
import type { PireMethod } from './general';
import type { PirePrimer, PirePrimerFunction } from './primer';
export declare type PireRoute = {
    GET?: PireMethod;
    POST?: PireMethod;
    PUT?: PireMethod;
    PATCH?: PireMethod;
    DELETE?: PireMethod;
    primers?: (PirePrimer | PirePrimerFunction)[];
    children?: PireRoutes;
    [path: `/${string}`]: PireRoute;
};
export declare type PireRoutes = Record<string, PireRoute>;
export declare type BuiltPaths = {
    method: HttpMethod;
    path: string;
}[];
