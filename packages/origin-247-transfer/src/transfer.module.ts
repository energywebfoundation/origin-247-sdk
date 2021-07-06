import {
    CertificateModule,
    CertificateForUnitTestsModule
} from '@energyweb/origin-247-certificate';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    EnergyTransferRequestEntity,
    EnergyTransferRequestPostgresRepository
} from './repositories/EnergyTransferRequestPostgres.repository';
import { IssueGenerationCertificateHandler } from './handlers/IssueGenerationCertificate.handler';
import { TransferCertificateHandler } from './handlers/TransferCertificate.handler';
import { EnergyTransferRequestInMemoryRepository } from './repositories/EnergyTransferRequestInMemory.repository';
import { ENERGY_TRANSFER_REQUEST_REPOSITORY } from './repositories/EnergyTransferRequest.repository';
import { TransferService } from './transfer.service';

@Module({
    providers: [
        IssueGenerationCertificateHandler,
        TransferCertificateHandler,
        TransferService,
        {
            provide: ENERGY_TRANSFER_REQUEST_REPOSITORY,
            useClass: EnergyTransferRequestPostgresRepository
        }
    ],
    imports: [
        TypeOrmModule.forFeature([EnergyTransferRequestEntity]),
        CqrsModule,
        CertificateModule
    ]
})
export class TransferModule {}

@Module({
    providers: [
        IssueGenerationCertificateHandler,
        TransferCertificateHandler,
        TransferService,
        {
            provide: ENERGY_TRANSFER_REQUEST_REPOSITORY,
            useClass: EnergyTransferRequestInMemoryRepository
        }
    ],
    imports: [CqrsModule, CertificateForUnitTestsModule]
})
export class TransferModuleForUnitTest {}
