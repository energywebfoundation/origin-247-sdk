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
import getConfiguration from '../offchain-certificate/config/configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Configuration } from '../offchain-certificate/config/config.interface';

const realCertificateProvider = {
    provide: ONCHAIN_CERTIFICATE_SERVICE_TOKEN,
    useClass: OnChainCertificateService
};

@Module({
    providers: [
        realCertificateProvider,
        BlockchainActionsProcessor,
        TransactionPollService,
        CertificateUpdatedHandler
    ],
    exports: [realCertificateProvider],
    imports: [
        IssuerModule.register({
            enableCertificationRequest: false
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            load: [getConfiguration]
        }),
        CqrsModule,
        BullModule.registerQueueAsync({
            name: blockchainQueueName,
            inject: [ConfigService],
            useFactory: (configService: ConfigService<Configuration>) => ({
                settings: {
                    lockDuration: configService.get('CERTIFICATE_QUEUE_LOCK_DURATION')
                }
            })
        })
    ]
})
export class OnChainCertificateModule {}

const inMemoryServiceProvider = {
    provide: ONCHAIN_CERTIFICATE_SERVICE_TOKEN,
    useClass: CertificateForUnitTestsService
};

@Module({
    providers: [inMemoryServiceProvider],
    exports: [inMemoryServiceProvider],
    imports: [CqrsModule]
})
export class OnChainCertificateForUnitTestsModule {}
