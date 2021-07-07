import { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { TransferValidationStatus } from '../EnergyTransferRequest';

export interface ValidateTransferCommandCtor {
    new (payload: { requestId: number; sellerId: string; buyerId: string }): ICommand;
}

export const VALIDATE_TRANSFER_COMMANDS_TOKEN = Symbol.for('VALIDATE_TRANSFER_COMMANDS_TOKEN');

export interface IValidateTransferCommandResponse {
    validationResult: TransferValidationStatus;
}

export interface IValidateTransferCommandHandler
    extends ICommandHandler<ICommand, IValidateTransferCommandResponse> {}
