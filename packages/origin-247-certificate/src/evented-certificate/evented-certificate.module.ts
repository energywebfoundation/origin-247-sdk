import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bull';
import { IssuerModule } from '@energyweb/issuer-api';
import { TransactionPollService } from '../transaction-poll.service';

import { BlockchainActionsProcessor } from '../blockchain-actions.processor';
import { CERTIFICATE_SERVICE_TOKEN } from '../types';
import { CertificateUpdatedHandler } from '../certificate-updated.handler';
import { CertificateModule } from '../certificate.module';
import { CERTIFICATE_COMMAND_REPOSITORY } from './repositories/CertificateCommand/CertificateCommand.repository';
import { CertificateCommandPostgresRepository } from './repositories/CertificateCommand/CertificateCommandPostgres.repository';
import { CERTIFICATE_EVENT_REPOSITORY } from './repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateEventPostgresRepository } from './repositories/CertificateEvent/CertificateEventPostgres.repository';
import { CertificateFacade } from './certificate.facade';

@Module({
    providers: [
        BlockchainActionsProcessor,
        TransactionPollService,
        CertificateUpdatedHandler,
        {
            provide: CERTIFICATE_COMMAND_REPOSITORY,
            useClass: CertificateCommandPostgresRepository
        },
        {
            provide: CERTIFICATE_EVENT_REPOSITORY,
            useClass: CertificateEventPostgresRepository
        },
        CertificateFacade
    ],
    exports: [CertificateFacade],
    imports: [CqrsModule, CertificateModule]
})
export class EventedCertificateModule {}
