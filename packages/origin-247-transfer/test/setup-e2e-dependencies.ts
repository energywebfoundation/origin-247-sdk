import { QueryHandler, CommandBus, CommandHandler } from '@nestjs/cqrs';
import {
    GetTransferSitesQuery,
    IGetTransferSitesQueryHandler,
    IValidateTransferCommandHandler,
    TransferValidationStatus,
    UpdateTransferValidationCommand,
    EnergyTransferRequestPublicAttrs
} from '../src';

@QueryHandler(GetTransferSitesQuery)
export class MockSitesQueryHandler implements IGetTransferSitesQueryHandler {
    async execute(query: GetTransferSitesQuery) {
        return {
            buyerAddress: '0xeF99b2A55E6D070bA2D12f79b368148BF7d6Fc10',
            sellerAddress: '0x212fb883109dC887a605B09078E219Db75e5AAc7'
        };
    }
}

export class SymmetricValidationCommand {
    constructor(public payload: EnergyTransferRequestPublicAttrs) {}
}

export class AsymmetricValidationCommand {
    constructor(public payload: EnergyTransferRequestPublicAttrs) {}
}

export class AsymmetricInstantValidationCommand {
    constructor(public payload: EnergyTransferRequestPublicAttrs) {}
}

@CommandHandler(SymmetricValidationCommand)
export class Command1Handler implements IValidateTransferCommandHandler {
    async execute() {
        return { validationResult: TransferValidationStatus.Valid };
    }
}

@CommandHandler(AsymmetricValidationCommand)
export class Command2Handler implements IValidateTransferCommandHandler {
    constructor(private commandBus: CommandBus) {}

    async execute(command: AsymmetricValidationCommand) {
        setTimeout(() => {
            this.commandBus.execute(
                new UpdateTransferValidationCommand({
                    requestId: command.payload.id,
                    status: TransferValidationStatus.Valid,
                    validatorName: AsymmetricValidationCommand.name
                })
            );
        }, 5000);

        return { validationResult: TransferValidationStatus.Pending };
    }
}

@CommandHandler(AsymmetricInstantValidationCommand)
export class Command3Handler implements IValidateTransferCommandHandler {
    constructor(private commandBus: CommandBus) {}

    async execute(command: AsymmetricInstantValidationCommand) {
        setImmediate(() => {
            this.commandBus.execute(
                new UpdateTransferValidationCommand({
                    requestId: command.payload.id,
                    status: TransferValidationStatus.Valid,
                    validatorName: AsymmetricInstantValidationCommand.name
                })
            );
        });

        return { validationResult: TransferValidationStatus.Pending };
    }
}
