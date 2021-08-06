import { UpdateTransferValidationCommand } from '../commands';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { ValidateService } from '../validate.service';

@CommandHandler(UpdateTransferValidationCommand)
export class UpdateTransferValidationCommandHandler
    implements ICommandHandler<UpdateTransferValidationCommand> {
    constructor(public validateService: ValidateService) {}

    async execute(command: UpdateTransferValidationCommand) {
        await this.validateService.updateValidationStatus(command.payload);
    }
}
