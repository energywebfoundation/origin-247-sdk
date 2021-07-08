import {
    CertificateModule,
    CertificateForUnitTestsModule
} from '@energyweb/origin-247-certificate';
import { Module, DynamicModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    EnergyTransferRequestEntity,
    EnergyTransferRequestPostgresRepository
} from './repositories/EnergyTransferRequestPostgres.repository';
import { GenerationReadingStoredEventHandler } from './handlers/GenerationReadingStoredEvent.handler';
import { CertificatePersistedEventHandler } from './handlers/CertificatePersistedEvent.handler';
import { EnergyTransferRequestInMemoryRepository } from './repositories/EnergyTransferRequestInMemory.repository';
import { ENERGY_TRANSFER_REQUEST_REPOSITORY } from './repositories/EnergyTransferRequest.repository';
import { TransferService } from './transfer.service';
import {
    ValidateTransferCommandCtor,
    VALIDATE_TRANSFER_COMMANDS_TOKEN
} from './commands/ValidateTransferCommand';
import { ValidatedTransferRequestEventHandler } from './handlers';
import { UpdateTransferValidationCommandHandler } from './handlers/UpdateTransferValidationCommand.handler';

export interface ITransferModuleParams {
    validateCommands: ValidateTransferCommandCtor[];
}

@Module({})
export class TransferModule {
    static register(params: ITransferModuleParams): DynamicModule {
        return {
            module: TransferModule,
            providers: [
                GenerationReadingStoredEventHandler,
                CertificatePersistedEventHandler,
                TransferService,
                ValidatedTransferRequestEventHandler,
                UpdateTransferValidationCommandHandler,
                {
                    provide: ENERGY_TRANSFER_REQUEST_REPOSITORY,
                    useClass: EnergyTransferRequestPostgresRepository
                },
                {
                    provide: VALIDATE_TRANSFER_COMMANDS_TOKEN,
                    useValue: params.validateCommands
                }
            ],
            imports: [
                TypeOrmModule.forFeature([EnergyTransferRequestEntity]),
                CqrsModule,
                CertificateModule
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
                GenerationReadingStoredEventHandler,
                CertificatePersistedEventHandler,
                TransferService,
                ValidatedTransferRequestEventHandler,
                UpdateTransferValidationCommandHandler,
                {
                    provide: ENERGY_TRANSFER_REQUEST_REPOSITORY,
                    useClass: EnergyTransferRequestInMemoryRepository
                },
                {
                    provide: VALIDATE_TRANSFER_COMMANDS_TOKEN,
                    useValue: params.validateCommands
                }
            ],
            imports: [CqrsModule, CertificateForUnitTestsModule]
        };
    }
}
