import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadsModule } from '../reads/reads.module';
import { ProofRequest } from './proof-request.entity';
import { ProofRequestService } from './proof-request.service';
import { ProofRequestsRepository } from './repositories/proof-request.repository';

@Module({
    imports: [TypeOrmModule.forFeature([ProofRequest]), ReadsModule, CqrsModule],
    providers: [ProofRequestsRepository, ProofRequestService],
    exports: [ProofRequestService]
})
export class ProofRequestModule {}
