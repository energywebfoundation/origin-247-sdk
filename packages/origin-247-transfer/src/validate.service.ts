import { Inject, Injectable } from '@nestjs/common';
import {
    EnergyTransferRequestRepository,
    ENERGY_TRANSFER_REQUEST_REPOSITORY
} from './repositories/EnergyTransferRequest.repository';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
    ValidateTransferCommandCtor,
    VALIDATE_TRANSFER_COMMANDS_TOKEN
} from './commands/ValidateTransferCommand';
import {
    EnergyTransferRequest,
    State,
    TransferValidationStatus,
    UpdateStatusCode
} from './EnergyTransferRequest';
import { chunk } from 'lodash';
import { AwaitingTransferEvent } from './batch/transfer.batch';
import { BatchConfiguration, BATCH_CONFIGURATION_TOKEN } from './batch/configuration';

export interface IUpdateValidationStatusCommand {
    requestId: number;
    status: TransferValidationStatus;
    validatorName: string;
}

@Injectable()
export class ValidateService {
    private readonly logger = new Logger(ValidateService.name);

    constructor(
        @Inject(ENERGY_TRANSFER_REQUEST_REPOSITORY)
        private etrRepository: EnergyTransferRequestRepository,
        @Inject(VALIDATE_TRANSFER_COMMANDS_TOKEN)
        private validateCommands: ValidateTransferCommandCtor[],
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration,
        private commandBus: CommandBus,
        private eventBus: EventBus
    ) {}

    public async validateTask(): Promise<void> {
        const etrs = await this.etrRepository.findByState(State.ValidationAwaiting);

        const chunkedEtrs = chunk(etrs, this.batchConfiguration.validateBatchSize);

        for (const chunk of chunkedEtrs) {
            await this.startValidation(chunk);
        }
    }

    private async startValidation(etrs: EnergyTransferRequest[]): Promise<void> {
        etrs.forEach((etr) => etr.startValidation(this.validateCommands.map((c) => c.name)));
        await this.etrRepository.saveManyInTransaction(etrs);

        if (this.validateCommands.length === 0) {
            this.eventBus.publish(new AwaitingTransferEvent());
            return;
        }

        const validateEtrsPromises = etrs.map(async (etr) => {
            try {
                await this.validateEtr(etr);
            } catch (e) {
                etr.validationError(e.message);
                await this.etrRepository.save(etr);
            }
        });

        await Promise.all(validateEtrsPromises);
    }

    public async updateValidationStatus(command: IUpdateValidationStatusCommand): Promise<void> {
        const { requestId, validatorName: commandName, status } = command;

        let isValid = false;

        await this.etrRepository.updateWithLock(requestId, (request) => {
            const result = request.updateValidationStatus(commandName, status);

            switch (result) {
                case UpdateStatusCode.NoValidator:
                    throw new Error(
                        `Cannot update status of transfer request: ${requestId}, because validator "${commandName}" is not present`
                    );
                case UpdateStatusCode.NotPending:
                    this.logger.warn(
                        `Skipping update of transfer request: ${requestId} to ${status}, because it is not pending`
                    );
                    break;
                case UpdateStatusCode.Success:
                    isValid = true;
                    break;
            }
        });

        if (isValid) {
            this.eventBus.publish(new AwaitingTransferEvent());
        }
    }

    private async validateEtr(request: EnergyTransferRequest): Promise<void> {
        const validationPromises = this.validateCommands.map(async (Command) => {
            const result = await this.executeCommand(Command, request);

            await this.updateValidationStatus({
                validatorName: Command.name,
                requestId: request.id,
                status: result.validationResult
            });
        });

        await Promise.all(validationPromises);
    }

    private async executeCommand(
        Command: ValidateTransferCommandCtor,
        request: EnergyTransferRequest
    ) {
        try {
            const command = new Command(request.toPublicAttrs());

            return await this.commandBus.execute(command);
        } catch (e) {
            this.logger.error(`
                One of validation commands (${Command.name}) returned error for request: ${request.id}:
                "${e.message}"
            `);

            return { validationResult: TransferValidationStatus.Error };
        }
    }
}
