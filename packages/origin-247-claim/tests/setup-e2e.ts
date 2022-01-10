import { Contracts, CertificateUtils } from '@energyweb/issuer';
import { BlockchainPropertiesService, BlockchainPropertiesModule } from '@energyweb/issuer-api';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CqrsModule } from '@nestjs/cqrs';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { Test } from '@nestjs/testing';
import { DatabaseService } from '@energyweb/origin-backend-utils';

import { entities as IssuerEntities } from '@energyweb/issuer-api';
import { PassportModule } from '@nestjs/passport';

import { MatchResultEntity } from '../src/repositories/MatchResult/MatchResult.entity';
import {
    MATCH_RESULT_REPOSITORY,
    MatchResultRepository
} from '../src/repositories/MatchResult/MatchResult.repository';

import { LeftoverConsumptionEntity } from '../src/repositories/LeftoverConsumption/LeftoverConsumption.entity';
import {
    LEFTOVER_CONSUMPTION_REPOSITORY,
    LeftoverConsumptionRepository
} from '../src/repositories/LeftoverConsumption/LeftoverConsumption.repository';

import { ExcessGenerationEntity } from '../src/repositories/ExcessGeneration/ExcessGeneration.entity';
import {
    EXCESS_GENERATION_REPOSITORY,
    ExcessGenerationRepository
} from '../src/repositories/ExcessGeneration/ExcessGeneration.repository';
import { ClaimModule } from '../src/claim.module';
import {
    OffChainCertificateEntities,
    OffChainCertificateService
} from '@energyweb/origin-247-certificate';
import { ClaimFacade } from '../src';
const testLogger = new Logger('e2e');

const web3 = process.env.WEB3 ?? 'http://localhost:8545';
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

export const bootstrapTestInstance = async () => {
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
                port: Number(process.env.DB_PORT) ?? 5432,
                username: process.env.DB_USERNAME ?? 'postgres',
                password: process.env.DB_PASSWORD ?? 'postgres',
                database: process.env.DB_DATABASE ?? 'origin',
                entities: [
                    ...IssuerEntities,
                    ...OffChainCertificateEntities,
                    MatchResultEntity,
                    LeftoverConsumptionEntity,
                    ExcessGenerationEntity
                ],
                logging: ['info'],
                keepConnectionAlive: true
            }),
            CqrsModule,
            QueueingModule(),
            PassportModule.register({ defaultStrategy: 'jwt' }),
            ClaimModule
        ],
        providers: [DatabaseService]
    }).compile();

    const app = moduleFixture.createNestApplication();

    const databaseService = await app.resolve<DatabaseService>(DatabaseService);
    const blockchainPropertiesService = await app.resolve<BlockchainPropertiesService>(
        BlockchainPropertiesService
    );
    const matchResultRepository = await app.resolve<MatchResultRepository>(MATCH_RESULT_REPOSITORY);
    const leftoverConsumptionRepository = await app.resolve<LeftoverConsumptionRepository>(
        LEFTOVER_CONSUMPTION_REPOSITORY
    );
    const excessGenerationRepository = await app.resolve<ExcessGenerationRepository>(
        EXCESS_GENERATION_REPOSITORY
    );
    const claimFacade = await app.resolve<ClaimFacade>(ClaimFacade);

    const certificateService = await app.resolve<OffChainCertificateService>(
        OffChainCertificateService
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
        matchResultRepository,
        leftoverConsumptionRepository,
        excessGenerationRepository,
        certificateService,
        claimFacade,
        app
    };
};
