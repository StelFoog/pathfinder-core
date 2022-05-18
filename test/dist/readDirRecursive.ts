import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export default function readdirRecursive(path: string, base: string = ''): string[] {
	function addToBase(add: string): string {
		return base ? `${base}/${add}` : add;
	}

	const files: string[] = [];
	readdirSync(path).forEach((v) => {
		if (!statSync(join(path, v)).isDirectory()) return files.push(addToBase(v));
		files.push(...readdirRecursive(`${path}/${v}`, addToBase(v)));
	});
	return files;
}
