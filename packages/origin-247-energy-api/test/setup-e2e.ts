import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { PassportModule } from '@nestjs/passport';
import { entities } from '../src';
import { EnergyApi247Module } from '../src/energy-api.module';
import { NotaryService } from '../src/notary/notary.service';
import { EnergyApi247Facade } from '../src/energy-api.facade';
import { ReadsService } from '../src/reads/reads.service';
import { READ_SERVICE } from '../src/reads/const';

const testLogger = new Logger('e2e');

process.env.WEB3 = 'http://localhost:8548';
process.env.DEPLOY_KEY = '0xb9e54b01a556f150e05272c25a9362096bce3b86e81e481c4d263e7768ac8c74';

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
            EnergyApi247Module,
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
    const facade = await app.resolve<EnergyApi247Facade>(EnergyApi247Facade);
    const readService = await app.resolve<ReadsService>(READ_SERVICE);

    return {
        databaseService,
        app,
        notaryService,
        commandBus,
        facade,
        readService
    };
};
