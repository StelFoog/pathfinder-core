import type { PireSendable } from './types';

export default class PireError extends Error {
	sendable: PireSendable;

	constructor(sendable: PireSendable) {
		super('Pire Error');
		this.sendable = sendable;
	}
}
