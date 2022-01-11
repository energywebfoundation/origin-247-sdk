import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bull';
import { IssuerModule } from '@energyweb/issuer-api';
import { TransactionPollService } from './transaction-poll.service';

import { CertificateService } from './certificate.service';
import { BlockchainActionsProcessor, blockchainQueueName } from './blockchain-actions.processor';
import { CERTIFICATE_SERVICE_TOKEN } from './types';
import { CertificateUpdatedHandler } from './certificate-updated.handler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Configuration } from './offchain-certificate/config/config.interface';

const serviceProvider = {
    provide: CERTIFICATE_SERVICE_TOKEN,
    useClass: CertificateService
};

@Module({
    providers: [
        serviceProvider,
        BlockchainActionsProcessor,
        TransactionPollService,
        CertificateUpdatedHandler
    ],
    exports: [serviceProvider],
    imports: [
        IssuerModule.register({
            enableCertificationRequest: false,
            enableTransactionLogging: true
        }),
        ConfigModule.forRoot(),
        CqrsModule,
        BullModule.registerQueueAsync({
            name: blockchainQueueName,
            imports: [ConfigService],
            useFactory: (configService: ConfigService<Configuration>) => ({
                settings: {
                    lockDuration: configService.get('CERTIFICATE_QUEUE_LOCK_DURATION')
                }
            })
        })
    ]
})
export class CertificateModule {}
