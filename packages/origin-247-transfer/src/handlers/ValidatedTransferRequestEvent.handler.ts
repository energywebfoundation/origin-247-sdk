import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ValidatedTransferRequestEvent } from '../events';
import { TransferService } from '../transfer.service';

@EventsHandler(ValidatedTransferRequestEvent)
export class ValidatedTransferRequestEventHandler
    implements IEventHandler<ValidatedTransferRequestEvent> {
    constructor(private transferService: TransferService) {}

    public async handle(event: ValidatedTransferRequestEvent) {
        await this.transferService.transferCertificate(event.payload.requestId);
    }
}
