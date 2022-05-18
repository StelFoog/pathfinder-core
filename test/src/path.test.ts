import { cleanPath } from '../../src';

describe('cleanPath', () => {
	test("appends '/' to begining of path when missing", () => {
		expect(cleanPath('foo')).toBe('/foo');
		expect(cleanPath('/foo')).toBe('/foo');
	});

	test("removes additional '/'s from path", () => {
		expect(cleanPath('/foo///bar')).toBe('/foo/bar');
		expect(cleanPath('/foo/bar')).toBe('/foo/bar');
	});

	test("removes suffix '/'s from path", () => {
		expect(cleanPath('/foo/')).toBe('/foo');
		expect(cleanPath('/foo//')).toBe('/foo');
	});
});
