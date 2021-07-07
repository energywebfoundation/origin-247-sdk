import { ICommand } from '@nestjs/cqrs';

export interface ValidateTransferCommandCtor {
    new (payload: { requestId: number; sellerId: string; buyerId: string }): ICommand;
}

export const VALIDATE_TRANSFER_COMMANDS_TOKEN = Symbol.for('VALIDATE_TRANSFER_COMMANDS_TOKEN');
