import {
    CertificateModule,
    CertificateForUnitTestsModule
} from '@energyweb/origin-247-certificate';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    EnergyTransferBlockEntity,
    EnergyTransferBlockPostgresRepository
} from './repositories/EnergyTransferBlockPostgres.repository';
import { IssueGenerationCertificateHandler } from './handlers/IssueGenerationCertificate.handler';
import { TransferCertificateHandler } from './handlers/TransferCertificate.handler';
import { EnergyTransferBlockInMemoryRepository } from './repositories/EnergyTransferBlockInMemory.repository';
import { ENERGY_TRANSFER_BLOCK_REPOSITORY } from './repositories/EnergyTransferBlock.repository';
import { TransferService } from './transfer.service';

@Module({
    providers: [
        IssueGenerationCertificateHandler,
        TransferCertificateHandler,
        TransferService,
        {
            provide: ENERGY_TRANSFER_BLOCK_REPOSITORY,
            useClass: EnergyTransferBlockPostgresRepository
        }
    ],
    imports: [TypeOrmModule.forFeature([EnergyTransferBlockEntity]), CqrsModule, CertificateModule]
})
export class TransferModule {}

@Module({
    providers: [
        IssueGenerationCertificateHandler,
        TransferCertificateHandler,
        TransferService,
        {
            provide: ENERGY_TRANSFER_BLOCK_REPOSITORY,
            useClass: EnergyTransferBlockInMemoryRepository
        }
    ],
    imports: [CqrsModule, CertificateForUnitTestsModule]
})
export class TransferModuleForUnitTest {}
