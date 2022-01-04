import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bull';
import { IssuerModule } from '@energyweb/issuer-api';
import { TransactionPollService } from './transaction-poll.service';
import { CertificateForUnitTestsService } from './onchain-certificateForUnitTests.service';
import { OnChainCertificateService } from './onchain-certificate.service';
import { BlockchainActionsProcessor, blockchainQueueName } from './blockchain-actions.processor';
import { ONCHAIN_CERTIFICATE_SERVICE_TOKEN } from './types';
import { CertificateUpdatedHandler } from './certificate-updated.handler';

@Module({
    providers: [
        {
            provide: ONCHAIN_CERTIFICATE_SERVICE_TOKEN,
            useClass: OnChainCertificateService
        },
        BlockchainActionsProcessor,
        TransactionPollService,
        CertificateUpdatedHandler
    ],
    exports: [ONCHAIN_CERTIFICATE_SERVICE_TOKEN],
    imports: [
        IssuerModule.register({
            enableCertificationRequest: false,
            enableTransactionLogging: true
        }),
        CqrsModule,
        BullModule.registerQueue({
            name: blockchainQueueName,
            settings: {
                lockDuration: Number(process.env.CERTIFICATE_QUEUE_LOCK_DURATION ?? 240 * 1000)
            }
        })
    ]
})
export class OnChainCertificateModule {}

@Module({
    providers: [
        {
            provide: ONCHAIN_CERTIFICATE_SERVICE_TOKEN,
            useClass: CertificateForUnitTestsService
        }
    ],
    exports: [ONCHAIN_CERTIFICATE_SERVICE_TOKEN],
    imports: [CqrsModule]
})
export class OnChainCertificateForUnitTestsModule {}
