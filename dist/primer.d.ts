import type { BodyFilterBuilderParams, BodyFilterBuilderConfig, HttpMethod, PireMethodPrimer, PirePrimer, PirePrimerFunction } from './types';
/**
 * Converts method primers to primers in object syntax
 * @param primers
 * @returns
 */
export declare function objectifyLocalPrimers(primers?: PireMethodPrimer[]): PirePrimer[];
/**
 * Prepares the given primers for use by building paths for includes and excludes and
 * converting function form primers to standard form primers
 * @param primers to prepare
 * @param path where the primers were given
 * @returns prepared primers
 */
export declare function preparePrimers(primers: (PirePrimer | PirePrimerFunction)[], path: string): PirePrimer[];
/**
 * Filters primers for a specific path and method
 * @param primers filter from
 * @param path
 * @param method
 * @returns filtered primers
 */
export declare function primersBuilder(primers: PirePrimer[], path: string, method: HttpMethod, excludePrimers: string[]): PirePrimer[];
/**
 * Converts list of missing properties to human intelligable string
 */
export declare function stringifyMissingList(list: string[]): string;
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
export declare function bodyFilterBuilder(params: BodyFilterBuilderParams, config?: BodyFilterBuilderConfig): PireMethodPrimer;
