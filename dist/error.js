"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PireError extends Error {
    constructor(sendable) {
        super('Pire Error');
        this.sendable = sendable;
    }
}
exports.default = PireError;
//# sourceMappingURL=error.js.map