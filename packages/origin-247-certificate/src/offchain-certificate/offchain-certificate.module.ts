import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
// import { CertificateModule } from '../certificate.module';
import { CERTIFICATE_COMMAND_REPOSITORY } from './repositories/CertificateCommand/CertificateCommand.repository';
import { CertificateCommandPostgresRepository } from './repositories/CertificateCommand/CertificateCommandPostgres.repository';
import { CERTIFICATE_EVENT_REPOSITORY } from './repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateEventPostgresRepository } from './repositories/CertificateEvent/CertificateEventPostgres.repository';
import { OffchainCertificateService } from './offchain-certificate.service';
import { OFFCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateCommandEntity } from './repositories/CertificateCommand/CertificateCommand.entity';
import { CertificateEventEntity } from './repositories/CertificateEvent/CertificateEvent.entity';
import { CertificateReadModelEntity } from './repositories/CertificateReadModel/CertificateReadModel.entity';
import { CERTIFICATE_READ_MODEL_REPOSITORY } from './repositories/CertificateReadModel/CertificateReadModel.repository';
import { CertificateReadModelPostgresRepository } from './repositories/CertificateReadModel/CertificateReadModelPostgres.repository';
import { BullModule } from '@nestjs/bull';
import { blockchainQueueName } from '../blockchain-actions.processor';
import { BlockchainSynchronizeService } from './synchronize/blockchain-synchronize.service';
import {
    blockchainSynchronizeQueueName,
    BlockchainSynchronizeTask
} from './synchronize/blockchain-synchronize.task';

const serviceProvider = {
    provide: OFFCHAIN_CERTIFICATE_SERVICE_TOKEN,
    useClass: OffchainCertificateService
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
        serviceProvider,
        BlockchainSynchronizeService,
        BlockchainSynchronizeTask
    ],
    exports: [serviceProvider],
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([
            CertificateEventEntity,
            CertificateCommandEntity,
            CertificateReadModelEntity
        ]),

        BullModule.registerQueue(
            {
                name: blockchainSynchronizeQueueName
            },
            {
                name: blockchainQueueName,
                settings: {
                    lockDuration: Number(process.env.CERTIFICATE_QUEUE_LOCK_DURATION ?? 240 * 1000)
                }
            }
        )
    ]
})
export class OffchainCertificateModule {}
