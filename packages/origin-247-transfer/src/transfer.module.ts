import {
    CertificateModule,
    CertificateForUnitTestsModule
} from '@energyweb/origin-247-certificate';
import { Module, DynamicModule, CacheModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenerationReadingStoredEventHandler } from './handlers/GenerationReadingStoredEvent.handler';
import {
    EnergyTransferRequestInMemoryRepository,
    EnergyTransferRequestEntity,
    EnergyTransferRequestPostgresRepository,
    ENERGY_TRANSFER_REQUEST_REPOSITORY
} from './repositories';
import { TransferService } from './transfer.service';
import {
    ValidateTransferCommandCtor,
    VALIDATE_TRANSFER_COMMANDS_TOKEN
} from './commands/ValidateTransferCommand';
import { UpdateTransferValidationCommandHandler } from './handlers/UpdateTransferValidationCommand.handler';
import { ValidateService } from './validate.service';
import { IssueService } from './issue.service';
import { AwaitingValidationEventHandler } from './batch/validate.batch';
import { AwaitingTransferEventHandler } from './batch/transfer.batch';
import { AwaitingIssuanceEventHandler } from './batch/issue.batch';
import { PersistanceService } from './persistance.service';
import { parseRedisUrl } from './utils/parseRedisUrl';
import {
    BatchConfiguration,
    BATCH_CONFIGURATION_TOKEN,
    defaultBatchConfiguration
} from './batch/configuration';
import { defaults } from 'lodash';
import { CertificatePersistedHandler } from './handlers/CertificatePersisted.handler';

export interface ITransferModuleParams {
    validateCommands: ValidateTransferCommandCtor[];
    batchConfiguration?: Partial<BatchConfiguration>;
}

const batchHandlers = [
    AwaitingValidationEventHandler,
    AwaitingTransferEventHandler,
    AwaitingIssuanceEventHandler
];

const integrationHandlers = [
    GenerationReadingStoredEventHandler,
    UpdateTransferValidationCommandHandler,
    CertificatePersistedHandler
];

const services = [TransferService, IssueService, ValidateService, PersistanceService];

@Module({})
export class TransferModule {
    static register(params: ITransferModuleParams): DynamicModule {
        return {
            module: TransferModule,
            providers: [
                ...services,
                ...integrationHandlers,
                ...batchHandlers,
                {
                    provide: ENERGY_TRANSFER_REQUEST_REPOSITORY,
                    useClass: EnergyTransferRequestPostgresRepository
                },
                {
                    provide: VALIDATE_TRANSFER_COMMANDS_TOKEN,
                    useValue: params.validateCommands
                },
                {
                    provide: BATCH_CONFIGURATION_TOKEN,
                    useValue: defaults(params.batchConfiguration ?? {}, defaultBatchConfiguration)
                }
            ],
            imports: [
                TypeOrmModule.forFeature([EnergyTransferRequestEntity]),
                CqrsModule,
                CertificateModule,
                CacheModule.registerAsync({
                    useFactory: async () => {
                        const importedModule = await import('cache-manager-ioredis');
                        const redisUrl = process.env.REDIS_URL;

                        if (redisUrl && importedModule) {
                            return {
                                store: importedModule,
                                ...parseRedisUrl(redisUrl)
                            };
                        }

                        return {};
                    }
                })
            ]
        };
    }
}

@Module({})
export class TransferModuleForUnitTest {
    static register(params: ITransferModuleParams): DynamicModule {
        return {
            module: TransferModuleForUnitTest,
            providers: [
                ...services,
                ...integrationHandlers,
                ...batchHandlers,
                {
                    provide: ENERGY_TRANSFER_REQUEST_REPOSITORY,
                    useClass: EnergyTransferRequestInMemoryRepository
                },
                {
                    provide: VALIDATE_TRANSFER_COMMANDS_TOKEN,
                    useValue: params.validateCommands
                },
                {
                    provide: BATCH_CONFIGURATION_TOKEN,
                    useValue: defaults(params.batchConfiguration ?? {}, defaultBatchConfiguration)
                }
            ],
            imports: [CqrsModule, CertificateForUnitTestsModule, CacheModule.register()]
        };
    }
}
