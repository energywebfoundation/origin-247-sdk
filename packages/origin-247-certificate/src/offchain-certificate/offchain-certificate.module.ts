import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CertificateCommandPostgresRepository } from './repositories/CertificateCommand/CertificateCommandPostgres.repository';
import { CertificateEventPostgresRepository } from './repositories/CertificateEvent/CertificateEventPostgres.repository';
import { OffChainCertificateService } from './offchain-certificate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateCommandEntity } from './repositories/CertificateCommand/CertificateCommand.entity';
import { CertificateEventEntity } from './repositories/CertificateEvent/CertificateEvent.entity';
import { CertificateReadModelEntity } from './repositories/CertificateReadModel/CertificateReadModel.entity';
import { CertificateReadModelPostgresRepository } from './repositories/CertificateReadModel/CertificateReadModelPostgres.repository';
import { BullModule } from '@nestjs/bull';
import { BlockchainSynchronizeService } from './synchronize/blockchain-synchronize.service';
import { BlockchainSynchronizeTask } from './synchronize/blockchain-synchronize.task';
import { SYNCHRONIZE_STRATEGY } from './synchronize/strategies/synchronize.strategy';
import {
    CERTIFICATE_COMMAND_REPOSITORY,
    CERTIFICATE_EVENT_REPOSITORY,
    CERTIFICATE_READ_MODEL_REPOSITORY,
    SYNCHRONIZE_QUEUE_NAME
} from './repositories/repository.keys';
import { ClaimPersistHandler } from './synchronize/handlers/claim-persist.handler';
import { TransferPersistHandler } from './synchronize/handlers/transfer-persist.handler';
import { OnChainCertificateModule } from '../onchain-certificate/onchain-certificate.module';
import { CertificateSynchronizationAttemptEntity } from './repositories/CertificateEvent/CertificateSynchronizationAttempt.entity';
import { CertificateEventService } from './repositories/CertificateEvent/CertificateEvent.service';
import { BatchSynchronizeStrategy } from './synchronize/strategies/batch/batch-synchronize.strategy';
import {
    BATCH_CONFIGURATION_TOKEN,
    batchConfiguration
} from './synchronize/strategies/batch/batch.configuration';
import { IssuePersistHandler } from './synchronize/handlers/issue-persist.handler';
import { SynchronizeManager } from './synchronize/handlers/synchronize.manager';
import { OFFCHAIN_CERTIFICATE_SERVICE_TOKEN } from '..';

const serviceProvider = {
    provide: OFFCHAIN_CERTIFICATE_SERVICE_TOKEN,
    useClass: OffChainCertificateService
};

@Module({
    providers: [
        {
            provide: CERTIFICATE_COMMAND_REPOSITORY,
            useClass: CertificateCommandPostgresRepository
        },
        {
            provide: CERTIFICATE_EVENT_REPOSITORY,
            useClass: CertificateEventPostgresRepository
        },
        {
            provide: CERTIFICATE_READ_MODEL_REPOSITORY,
            useClass: CertificateReadModelPostgresRepository
        },
        {
            provide: SYNCHRONIZE_STRATEGY,
            useClass: BatchSynchronizeStrategy
        },
        {
            provide: BATCH_CONFIGURATION_TOKEN,
            useValue: batchConfiguration
        },
        serviceProvider,
        BlockchainSynchronizeService,
        BlockchainSynchronizeTask,
        IssuePersistHandler,
        ClaimPersistHandler,
        TransferPersistHandler,
        SynchronizeManager,
        CertificateEventService
    ],
    exports: [serviceProvider],
    imports: [
        OnChainCertificateModule,
        CqrsModule,
        TypeOrmModule.forFeature([
            CertificateEventEntity,
            CertificateCommandEntity,
            CertificateReadModelEntity,
            CertificateSynchronizationAttemptEntity
        ]),

        BullModule.registerQueue({
            name: SYNCHRONIZE_QUEUE_NAME
        })
    ]
})
export class OffChainCertificateModule {}
