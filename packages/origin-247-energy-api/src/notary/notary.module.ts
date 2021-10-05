import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { NotaryProof } from './notary-proof.entity';
import { NotaryContract } from './notary-contract.entity';
import { NotaryService } from './notary.service';
import { CreateProofHandler } from './handlers/create-proof.handler';
import { PersistProofHandler } from './handlers/persist-proof.handler';

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([NotaryProof, NotaryContract])],
    providers: [NotaryService, CreateProofHandler, PersistProofHandler],
    exports: [NotaryService]
})
export class NotaryModule {}
