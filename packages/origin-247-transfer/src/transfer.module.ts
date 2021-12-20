import {
    CertificateModule,
    CertificateForUnitTestsModule,
    OffchainCertificateModule
} from '@energyweb/origin-247-certificate';
import { Module, DynamicModule } from '@nestjs/common';
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
import {
    BatchConfiguration,
    BATCH_CONFIGURATION_TOKEN,
    defaultBatchConfiguration
} from './batch/configuration';
import { defaults } from 'lodash';

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
    UpdateTransferValidationCommandHandler
];

const services = [TransferService, IssueService, ValidateService];

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
                OffchainCertificateModule
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
            imports: [CqrsModule, CertificateForUnitTestsModule]
        };
    }
}
