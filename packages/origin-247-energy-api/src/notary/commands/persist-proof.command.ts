import { IReadingsProof } from '~/util/proof';

export class PersistProofCommand {
    constructor(public readonly deviceId: string, public readonly proof: IReadingsProof) {}
}
