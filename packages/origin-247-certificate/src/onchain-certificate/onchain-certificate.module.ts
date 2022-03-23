import { Module, OnModuleInit } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bull';
import { TransactionPollService } from './certificate-operations/transaction-poll.service';
import { CertificateForUnitTestsService } from './onchain-certificateForUnitTests.service';
import { OnChainCertificateService } from './onchain-certificate.service';
import { BlockchainActionsProcessor, blockchainQueueName } from './blockchain-actions.processor';
import { ONCHAIN_CERTIFICATE_SERVICE_TOKEN } from './types';
import { BlockchainPropertiesService } from './blockchain-properties.service';
import { OnChainCertificateFacade } from './onChainCertificateFacade';
import { DeploymentPropertiesRepository } from './repositories/deploymentProperties/deploymentProperties.repository';
import { DeploymentPropertiesPostgresRepository } from './repositories/deploymentProperties/deploymentPropertiesPostgres.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeploymentPropertiesEntity } from './repositories/deploymentProperties/deploymentProperties.entity';
import { BatchClaimCertificatesHandler } from './certificate-operations/claim/batch-claim-certificates.handler';
import { BatchIssueCertificatesHandler } from './certificate-operations/issue/batch-issue-certificates.handler';
import { BatchTransferCertificatesHandler } from './certificate-operations/transfer/batch-transfer-certificates.handler';
import { ClaimCertificateHandler } from './certificate-operations/claim/claim-certificate.handler';
import { IssueCertificateHandler } from './certificate-operations/issue/issue-certificate.handler';
import { TransferCertificateHandler } from './certificate-operations/transfer/transfer-certificate.handler';
import { CertificateOperationsService } from './certificate-operations/certificate-operations.service';
import { CERTIFICATE_READ_MODEL_REPOSITORY } from '../offchain-certificate/repositories/repository.keys';
import { CertificateReadModelInMemoryRepository } from '../offchain-certificate/repositories/CertificateReadModel/CertificateReadModelInMemory.repository';
import { CertificateReadModelPostgresRepository } from '../offchain-certificate/repositories/CertificateReadModel/CertificateReadModelPostgres.repository';
import { CertificateReadModelEntity } from '../offchain-certificate/repositories/CertificateReadModel/CertificateReadModel.entity';
import { OnChainWatcher } from './listeners/on-chain-certificates.listener';
import { getConfiguration, validateConfiguration } from '../config/configuration';

const realCertificateProvider = {
    provide: ONCHAIN_CERTIFICATE_SERVICE_TOKEN,
    useClass: OnChainCertificateService
};

@Module({
    providers: [
        realCertificateProvider,
        BlockchainActionsProcessor,
        TransactionPollService,
        BlockchainPropertiesService,
        OnChainCertificateFacade,

        BatchClaimCertificatesHandler,
        BatchIssueCertificatesHandler,
        BatchTransferCertificatesHandler,
        ClaimCertificateHandler,
        IssueCertificateHandler,
        TransferCertificateHandler,
        CertificateOperationsService,
        TransactionPollService,
        OnChainWatcher,
        {
            provide: DeploymentPropertiesRepository,
            useClass: DeploymentPropertiesPostgresRepository
        },
        {
            provide: CERTIFICATE_READ_MODEL_REPOSITORY,
            useClass: CertificateReadModelPostgresRepository
        }
    ],
    exports: [realCertificateProvider, OnChainCertificateFacade],
    imports: [
        CqrsModule,
        BullModule.registerQueueAsync({
            name: blockchainQueueName,
            useFactory: () => ({
                settings: {
                    lockDuration: getConfiguration().CERTIFICATE_QUEUE_LOCK_DURATION
                }
            })
        }),
        TypeOrmModule.forFeature([DeploymentPropertiesEntity, CertificateReadModelEntity])
    ]
})
export class OnChainCertificateModule implements OnModuleInit {
    async onModuleInit(): Promise<any> {
        await validateConfiguration();
    }
}

const inMemoryServiceProvider = {
    provide: ONCHAIN_CERTIFICATE_SERVICE_TOKEN,
    useClass: CertificateForUnitTestsService
};

@Module({
    providers: [
        inMemoryServiceProvider,
        {
            provide: CERTIFICATE_READ_MODEL_REPOSITORY,
            useClass: CertificateReadModelInMemoryRepository
        }
    ],
    exports: [inMemoryServiceProvider],
    imports: [CqrsModule]
})
export class OnChainCertificateForUnitTestsModule implements OnModuleInit {
    async onModuleInit(): Promise<any> {
        await validateConfiguration();
    }
}
