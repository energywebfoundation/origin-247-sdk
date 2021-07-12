import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GenerationReadingStoredEvent } from '../events/GenerationReadingStored.event';
import { TransferService } from '../transfer.service';

@EventsHandler(GenerationReadingStoredEvent)
export class GenerationReadingStoredEventHandler
    implements IEventHandler<GenerationReadingStoredEvent> {
    constructor(private transferService: TransferService) {}

    async handle(event: GenerationReadingStoredEvent) {
        await this.transferService.issue(event.data);
    }
}
