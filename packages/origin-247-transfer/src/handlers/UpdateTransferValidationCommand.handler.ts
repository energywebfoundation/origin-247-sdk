import { UpdateTransferValidationCommand } from '../commands';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { TransferService } from '../transfer.service';

@CommandHandler(UpdateTransferValidationCommand)
export class UpdateTransferValidationCommandHandler
    implements ICommandHandler<UpdateTransferValidationCommand> {
    constructor(public transferService: TransferService) {}

    async execute(command: UpdateTransferValidationCommand) {
        await this.transferService.updateValidationStatus(command.payload);
    }
}
