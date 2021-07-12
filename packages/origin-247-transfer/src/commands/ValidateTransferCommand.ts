import { ICommand, ICommandHandler } from '@nestjs/cqrs';
import {
    EnergyTransferRequestPublicAttrs,
    TransferValidationStatus
} from '../EnergyTransferRequest';

export interface ValidateTransferCommandCtor {
    new (payload: EnergyTransferRequestPublicAttrs): ICommand;
}

export const VALIDATE_TRANSFER_COMMANDS_TOKEN = Symbol.for('VALIDATE_TRANSFER_COMMANDS_TOKEN');

export interface IValidateTransferCommandResponse {
    validationResult: TransferValidationStatus;
}

export interface IValidateTransferCommandHandler
    extends ICommandHandler<ICommand, IValidateTransferCommandResponse> {}
