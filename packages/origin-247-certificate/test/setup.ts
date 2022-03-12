import { CertificateUtils, Contracts } from '@energyweb/issuer';
import { getConnectionToken, TypeOrmModule } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { Test } from '@nestjs/testing';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import {
    BlockchainSynchronizeService,
    OffChainCertificateEntities,
    OffChainCertificateModule,
    OffChainCertificateService,
    ONCHAIN_CERTIFICATE_SERVICE_TOKEN,
    OnChainCertificateEntities,
    OnChainCertificateModule,
    OnChainCertificateService
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
import { Connection } from 'typeorm';
import getConfiguration from '../src/offchain-certificate/config/configuration';
import { BlockchainPropertiesService } from '../src/onchain-certificate/blockchain-properties.service';
import { ConfigService } from '@nestjs/config';
import { DeploymentPropertiesRepository } from '../src/onchain-certificate/repositories/deploymentProperties/deploymentProperties.repository';

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

export const bootstrapTestInstance: any = async () => {
    const configuration = getConfiguration();

    const QueueingModule = () => {
        return BullModule.forRoot({
            redis: configuration.REDIS_URL
        });
    };

    const moduleFixture = await Test.createTestingModule({
        imports: [
            TypeOrmModule.forRoot({
                type: 'postgres',
                host: configuration.DB_HOST,
                port: configuration.DB_PORT,
                username: configuration.DB_USERNAME,
                password: configuration.DB_PASSWORD,
                database: configuration.DB_DATABASE,
                logging: ['info'],
                keepConnectionAlive: true,
                entities: [...OffChainCertificateEntities, ...OnChainCertificateEntities]
            }),
            OffChainCertificateModule,
            OnChainCertificateModule,
            QueueingModule(),
            PassportModule.register({ defaultStrategy: 'jwt' })
        ],
        providers: [DatabaseService]
    }).compile();

    const app = moduleFixture.createNestApplication();

    const certificateService = await app.resolve<OnChainCertificateService>(
        ONCHAIN_CERTIFICATE_SERVICE_TOKEN
    );
    const databaseService = await app.resolve<DatabaseService>(DatabaseService);
    const certificateEventRepository = await app.resolve<CertificateEventRepository>(
        CERTIFICATE_EVENT_REPOSITORY
    );
    const certificateEventService = await app.resolve(CertificateEventService);
    const certificateReadModelRepository = await app.resolve<
        CertificateReadModelRepository<unknown>
    >(CERTIFICATE_READ_MODEL_REPOSITORY);
    const offchainCertificateService = await app.resolve<OffChainCertificateService>(
        OffChainCertificateService
    );
    const blockchainSynchronizeService = await app.resolve<BlockchainSynchronizeService>(
        BlockchainSynchronizeService
    );
    const certificateCommandRepository = await app.resolve<CertificateCommandRepository>(
        CERTIFICATE_COMMAND_REPOSITORY
    );
    const blockchainPropertiesService = await app.resolve<BlockchainPropertiesService>(
        BlockchainPropertiesService
    );

    const connection = await app.resolve<Connection>(getConnectionToken());
    const tables = connection.entityMetadatas
        .filter((e) => !['certificate_deployment_properties'].includes(e.tableName))
        .map((e) => `"${e.tableName}"`)
        .join(', ');

    const cleanDB = async () => {
        await connection.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE;`);
        // Restart all sequences
        await connection.query(`
            SELECT SETVAL(c.oid, 1)
            from pg_class c
                     JOIN pg_namespace n
                          on n.oid = c.relnamespace
            where c.relkind = 'S'
              and n.nspname = 'public'
        `);
    };

    await blockchainPropertiesService.deploy();
    await CertificateUtils.approveOperator(
        registryDeployer.address,
        await blockchainPropertiesService.wrap(userWallet.privateKey)
    );

    await CertificateUtils.approveOperator(
        registryDeployer.address,
        await blockchainPropertiesService.wrap(user2Wallet.privateKey)
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
        blockchainSynchronizeService,
        app,
        cleanDB
    };
};
