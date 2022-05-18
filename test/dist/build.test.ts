import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import readdirRecursive from './readDirRecursive';

const distPath = join(process.cwd(), 'dist');
const srcPath = join(process.cwd(), 'src');
const srcFiles = readdirRecursive(srcPath);
const srcPaths = srcFiles.map((v) => join(srcPath, v));
const distPaths = srcFiles.map((v) => join(distPath, v.replace(/\.ts$/, '.js')));
const distTypesPaths = srcFiles.map((v) => join(distPath, v.replace(/\.ts$/, '.d.ts')));
const distMapPaths = srcFiles.map((v) => join(distPath, v.replace(/\.ts$/, '.js.map')));

describe('Build', () => {
	test('all files exist', () => {
		distPaths.forEach((d) => expect(existsSync(d)).toBe(true));
		distTypesPaths.forEach((d) => expect(existsSync(d)).toBe(true));
		distMapPaths.forEach((d) => expect(existsSync(d)).toBe(true));
	});

	test('all files are up to date', () => {
		for (let i = 0; i < distMapPaths.length; i++) {
			const map = JSON.parse(readFileSync(distMapPaths[i]).toString());
			const src = readFileSync(srcPaths[i]).toString();
			expect(map.sourcesContent).toEqual([src]);
		}
	});
});
