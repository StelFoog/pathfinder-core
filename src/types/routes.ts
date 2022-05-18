import type { HttpMethod } from '../http';
import type { PireMethod } from './general';
import type { PirePrimer, PirePrimerFunction } from './primer';

export type PireRoute = {
	GET?: PireMethod;
	POST?: PireMethod;
	PUT?: PireMethod;
	PATCH?: PireMethod;
	DELETE?: PireMethod;
	primers?: (PirePrimer | PirePrimerFunction)[];
	children?: PireRoutes;
	[path: `/${string}`]: PireRoute;
};

export type PireRoutes = Record<string, PireRoute>;

// List of built paths
export type BuiltPaths = { method: HttpMethod; path: string }[];
