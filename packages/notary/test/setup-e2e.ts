import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { PassportModule } from '@nestjs/passport';
import { entities, NotaryModule, NotaryService } from '../src';

const testLogger = new Logger('e2e');

process.env.WEB3 = 'http://localhost:8548';
process.env.DEPLOY_KEY = '0xb9e54b01a556f150e05272c25a9362096bce3b86e81e481c4d263e7768ac8c74';

export const deployer = {
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

export const bootstrapTestInstance = async () => {
    const moduleFixture = await Test.createTestingModule({
        imports: [
            TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST ?? 'localhost',
                port: Number(process.env.DB_PORT ?? 5432),
                username: process.env.DB_USERNAME ?? 'postgres',
                password: process.env.DB_PASSWORD ?? 'postgres',
                database: process.env.DB_DATABASE ?? 'origin',
                entities,
                logging: ['info'],
                keepConnectionAlive: true
            }),
            NotaryModule,
            CqrsModule,
            PassportModule.register({ defaultStrategy: 'jwt' })
        ],
        providers: [DatabaseService]
    }).compile();

    const app = moduleFixture.createNestApplication();

    app.useLogger(testLogger);
    app.enableCors();

    const databaseService = await app.resolve<DatabaseService>(DatabaseService);
    const notaryService = await app.resolve<NotaryService>(NotaryService);
    const commandBus = await app.resolve<CommandBus>(CommandBus);

    await databaseService.query('TRUNCATE notary_contract RESTART IDENTITY CASCADE;');
    await databaseService.query('TRUNCATE notary_proof RESTART IDENTITY CASCADE;');

    return {
        databaseService,
        app,
        notaryService,
        commandBus
    };
};
