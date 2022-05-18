import { codifyHttpStatus } from '../../src';
import type { HttpStatusCodes, HttpStatusNames } from '../../src/types';

import { httpStatusCodesCollection, httpStatusCodeMap } from '../../src/http';

describe('codifyHttpStatus', () => {
	test('returns same value when giving a status code', () => {
		const httpStatusCodes = Object.keys(httpStatusCodesCollection).map((n) =>
			Number(n)
		) as HttpStatusCodes[];
		const randomStatusCode = httpStatusCodes[Math.floor(Math.random() * httpStatusCodes.length)];

		const codified = codifyHttpStatus(randomStatusCode);
		expect(typeof codified).toBe('number');
		expect(codified).toBe(randomStatusCode);
	});

	test('returns correct status code when giving a HTTP status as a string', () => {
		const httpStatusStrings = Object.entries(httpStatusCodeMap) as [
			HttpStatusNames,
			HttpStatusCodes
		][];
		const [randomStatusString, randomStatusCode] =
			httpStatusStrings[Math.floor(Math.random() * httpStatusStrings.length)];

		const codified = codifyHttpStatus(randomStatusString);
		expect(typeof codified).toBe('number');
		expect(codified).toBe(randomStatusCode);
	});
});
