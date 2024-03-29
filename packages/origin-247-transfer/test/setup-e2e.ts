import { CertificateUtils } from '@energyweb/issuer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import {
    ENERGY_TRANSFER_REQUEST_REPOSITORY,
    EnergyTransferRequestEntity,
    EnergyTransferRequestRepository,
    GenerationReadingStoredEvent,
    TransferModule
} from '../src';
import {
    BlockchainPropertiesService,
    OffChainCertificateEntities,
    OffChainCertificateService,
    OnChainCertificateEntities
} from '@energyweb/origin-247-certificate';
import { PassportModule } from '@nestjs/passport';
import {
    AsymmetricInstantValidationCommand,
    AsymmetricValidationCommand,
    Command1Handler,
    Command2Handler,
    Command3Handler,
    MockSitesQueryHandler,
    SymmetricValidationCommand
} from './setup-e2e-dependencies';

const testLogger = new Logger('e2e');

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

export const bootstrapTestInstance = async (SitesQueryHandler = MockSitesQueryHandler) => {
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
                    ...OffChainCertificateEntities,
                    ...OnChainCertificateEntities,
                    EnergyTransferRequestEntity
                ],
                logging: ['info'],
                keepConnectionAlive: true
            }),
            TransferModule.register({
                validateCommands: [
                    SymmetricValidationCommand,
                    AsymmetricValidationCommand,
                    AsymmetricInstantValidationCommand
                ]
            }),
            CqrsModule,
            QueueingModule(),
            PassportModule.register({ defaultStrategy: 'jwt' })
        ],
        providers: [
            DatabaseService,
            SitesQueryHandler,
            Command1Handler,
            Command2Handler,
            Command3Handler
        ]
    }).compile();

    const app = moduleFixture.createNestApplication();

    const certificateService = await app.resolve<OffChainCertificateService>(
        OffChainCertificateService
    );
    const databaseService = await app.resolve<DatabaseService>(DatabaseService);
    const blockchainPropertiesService = await app.resolve<BlockchainPropertiesService>(
        BlockchainPropertiesService
    );

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

    const eventBus = await app.resolve<EventBus>(EventBus);
    const repository = (await app.resolve<EnergyTransferRequestRepository>(
        ENERGY_TRANSFER_REQUEST_REPOSITORY
    )) as EnergyTransferRequestRepository;

    await databaseService.query('TRUNCATE energy_transfer_request_v2 RESTART IDENTITY CASCADE;');

    return {
        databaseService,
        certificateService,
        app,
        repository,
        startProcess: (generatorId = 'a1') =>
            eventBus.publish(
                new GenerationReadingStoredEvent({
                    energyValue: '60',
                    fromTime: new Date(),
                    generatorId,
                    metadata: { field: 'test' },
                    toTime: new Date(),
                    transferDate: new Date()
                })
            )
    };
};
