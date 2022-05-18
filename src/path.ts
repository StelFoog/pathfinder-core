/**
 * Cleans the path by removing any extra `/` characters and prefixing the path with a `/` character
 * if it didn't have one
 * @param path
 * @returns Clean path
 */
export function cleanPath(path: string): string {
	return (
		'/' +
		path
			.split('/')
			.filter((n) => !!n)
			.join('/')
	);
}
