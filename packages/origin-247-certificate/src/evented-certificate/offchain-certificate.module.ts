import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TransactionPollService } from '../transaction-poll.service';

import { BlockchainActionsProcessor } from '../blockchain-actions.processor';
import { CertificateUpdatedHandler } from '../certificate-updated.handler';
import { CertificateModule } from '../certificate.module';
import { CERTIFICATE_COMMAND_REPOSITORY } from './repositories/CertificateCommand/CertificateCommand.repository';
import { CertificateCommandPostgresRepository } from './repositories/CertificateCommand/CertificateCommandPostgres.repository';
import { CERTIFICATE_EVENT_REPOSITORY } from './repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateEventPostgresRepository } from './repositories/CertificateEvent/CertificateEventPostgres.repository';
import { OffchainCertificateService } from './offchain-certificate.service';
import { CERTIFICATE_SERVICE_TOKEN } from 'src/types';

const serviceProvider = {
    provide: CERTIFICATE_SERVICE_TOKEN,
    useClass: OffchainCertificateService
};

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
        OffchainCertificateService
    ],
    exports: [serviceProvider],
    imports: [CqrsModule, CertificateModule]
})
export class OffchainCertificateModule {}
