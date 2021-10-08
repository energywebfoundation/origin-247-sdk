import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PersistProofCommand } from '../commands/persist-proof.command';
import { NotaryProof } from '../notary-proof.entity';

@CommandHandler(PersistProofCommand)
export class PersistProofHandler implements ICommandHandler<PersistProofCommand> {
    constructor(
        @InjectRepository(NotaryProof)
        private readonly repository: Repository<NotaryProof>
    ) {}

    async execute({ deviceId, proof }: PersistProofCommand): Promise<NotaryProof> {
        return await this.repository.save({
            deviceId,
            readings: proof.readings,
            rootHash: proof.rootHash,
            leafs: proof.leafs,
            salts: proof.salts
        });
    }
}
