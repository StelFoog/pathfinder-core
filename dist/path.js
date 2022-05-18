"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanPath = void 0;
/**
 * Cleans the path by removing any extra `/` characters and prefixing the path with a `/` character
 * if it didn't have one
 * @param path
 * @returns Clean path
 */
function cleanPath(path) {
    return ('/' +
        path
            .split('/')
            .filter((n) => !!n)
            .join('/'));
}
exports.cleanPath = cleanPath;
//# sourceMappingURL=path.js.map