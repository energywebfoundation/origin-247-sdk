import { Reading } from '~/util';

export class CreateProofCommand {
    constructor(public readonly deviceId: string, public readonly readings: Reading[]) {}
}
