import { IUpdateValidationStatusCommand } from '../transfer.service';

/**
 * Used by external service to update validation status of one of the transfer requests
 */
export class UpdateTransferValidationCommand {
    constructor(public payload: IUpdateValidationStatusCommand) {}
}
