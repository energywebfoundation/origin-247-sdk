import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { NotaryProof } from './notary-proof.entity';
import { NotaryContract } from './notary-contract.entity';
import { Handlers } from './handlers';
import { NotaryService } from './notary.service';

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([NotaryProof, NotaryContract])],
    providers: [NotaryService, ...Handlers],
    exports: [NotaryService]
})
export class NotaryModule {}
