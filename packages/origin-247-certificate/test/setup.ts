import { CertificateUtils, Contracts } from '@energyweb/issuer';
import {
    BlockchainPropertiesModule,
    BlockchainPropertiesService,
    entities as IssuerEntities
} from '@energyweb/issuer-api';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { Test } from '@nestjs/testing';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import {
    CERTIFICATE_SERVICE_TOKEN,
    CertificateEntities,
    CertificateModule,
    CertificateService,
    OFFCHAIN_CERTIFICATE_SERVICE_TOKEN,
    OffchainCertificateModule,
    OffchainCertificateService
} from '../src';
import { PassportModule } from '@nestjs/passport';
import { CertificateEventRepository } from '../src/offchain-certificate/repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateReadModelRepository } from '../src/offchain-certificate/repositories/CertificateReadModel/CertificateReadModel.repository';
import { CertificateCommandRepository } from '../src/offchain-certificate/repositories/CertificateCommand/CertificateCommand.repository';
import {
    CERTIFICATE_COMMAND_REPOSITORY,
    CERTIFICATE_EVENT_REPOSITORY,
    CERTIFICATE_READ_MODEL_REPOSITORY
} from '../src/offchain-certificate/repositories/repository.keys';
import { CertificateEventService } from '../src/offchain-certificate/repositories/CertificateEvent/CertificateEvent.service';

const testLogger = new Logger('e2e');

const web3 = 'http://localhost:8545';
const provider = getProviderWithFallback(web3);

export const registryDeployer = {
    address: '0xBBad6d3d893e9E75fE8e73cb5Ac6E2C82C9A91d0',
    privateKey: '0xb9e54b01a556f150e05272c25a9362096bce3b86e81e481c4d263e7768ac8c74'
};

export const userWallet = {
    address: '0xeF99b2A55E6D070bA2D12f79b368148BF7d6Fc10',
    privateKey: '0xb4caabdf3fc44a7ca34238d3c7363127d5dbfdfd39244ebe2dad2e472e7eda60'
};

export const user2Wallet = {
    address: '0x212fb883109dC887a605B09078E219Db75e5AAc7',
    privateKey: '0x9d4b1fbf6a730b6399ada447b0cf19a25ed91f819d7c860d0aa0de779badc8c2'
};

const deployRegistry = async () => {
    return Contracts.migrateRegistry(provider, registryDeployer.privateKey);
};

const deployIssuer = async (registry: string) => {
    return Contracts.migrateIssuer(provider, registryDeployer.privateKey, registry);
};

export const bootstrapTestInstance: any = async () => {
    const registry = await deployRegistry();
    const issuer = await deployIssuer(registry.address);

    const QueueingModule = () => {
        return BullModule.forRoot({
            redis: process.env.REDIS_URL ?? { host: 'localhost', port: 6379 }
        });
    };

    const moduleFixture = await Test.createTestingModule({
        imports: [
            TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST ?? 'localhost',
                port: Number(process.env.DB_PORT ?? 5432),
                username: process.env.DB_USERNAME ?? 'postgres',
                password: process.env.DB_PASSWORD ?? 'postgres',
                database: process.env.DB_DATABASE ?? 'origin',
                logging: ['info'],
                keepConnectionAlive: true,
                entities: [...IssuerEntities, ...CertificateEntities]
            }),
            OffchainCertificateModule,
            CertificateModule,
            QueueingModule(),
            BlockchainPropertiesModule,
            PassportModule.register({ defaultStrategy: 'jwt' })
        ],
        providers: [DatabaseService]
    }).compile();

    const app = moduleFixture.createNestApplication();

    const certificateService = await app.resolve<CertificateService>(CERTIFICATE_SERVICE_TOKEN);
    const databaseService = await app.resolve<DatabaseService>(DatabaseService);
    const blockchainPropertiesService = await app.resolve<BlockchainPropertiesService>(
        BlockchainPropertiesService
    );
    const certificateEventRepository = await app.resolve<CertificateEventRepository>(
        CERTIFICATE_EVENT_REPOSITORY
    );
    const certificateEventService = await app.resolve(CertificateEventService);
    const certificateReadModelRepository = await app.resolve<CertificateReadModelRepository>(
        CERTIFICATE_READ_MODEL_REPOSITORY
    );
    const offchainCertificateService = await app.resolve<OffchainCertificateService>(
        OFFCHAIN_CERTIFICATE_SERVICE_TOKEN
    );
    const certificateCommandRepository = await app.resolve<CertificateCommandRepository>(
        CERTIFICATE_COMMAND_REPOSITORY
    );
    const blockchainProperties = await blockchainPropertiesService.create(
        provider.network.chainId,
        registry.address,
        issuer.address,
        web3,
        registryDeployer.privateKey
    );

    await CertificateUtils.approveOperator(
        registryDeployer.address,
        blockchainProperties.wrap(userWallet.privateKey)
    );

    await CertificateUtils.approveOperator(
        registryDeployer.address,
        blockchainProperties.wrap(user2Wallet.privateKey)
    );

    app.useLogger(testLogger);
    app.enableCors();

    return {
        databaseService,
        certificateService,
        certificateEventRepository,
        certificateCommandRepository,
        certificateReadModelRepository,
        certificateEventService,
        offchainCertificateService,
        app
    };
};
