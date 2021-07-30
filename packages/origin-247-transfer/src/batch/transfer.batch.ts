import { IEvent, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransferService } from '../transfer.service';
import { queueThrottle } from './queueThrottle';
import { BatchConfiguration, BATCH_CONFIGURATION_TOKEN } from './configuration';

export class AwaitingTransferEvent implements IEvent {}

@EventsHandler(AwaitingTransferEvent)
export class AwaitingTransferEventHandler implements IEventHandler<AwaitingTransferEvent> {
    constructor(
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration,
        private transferService: TransferService
    ) {}

    public handle = queueThrottle<AwaitingTransferEvent>(
        () => this.transferService.transferTask(),
        this.batchConfiguration.transferAggregateSeconds
    );
}
