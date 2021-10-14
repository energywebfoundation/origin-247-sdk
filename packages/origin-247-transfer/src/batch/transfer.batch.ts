import { IEvent, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TransferService } from '../transfer.service';
import { queueThrottle } from './queueThrottle';
import { BatchConfiguration, BATCH_CONFIGURATION_TOKEN } from './configuration';

export class AwaitingTransferEvent implements IEvent {}

@EventsHandler(AwaitingTransferEvent)
export class AwaitingTransferEventHandler implements IEventHandler<AwaitingTransferEvent> {
    public handle: VoidFunction;
    private unsubscribe: VoidFunction;

    constructor(
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration,
        private transferService: TransferService
    ) {
        const { trigger, unsubscribe } = queueThrottle(
            () => this.transferService.transferTask(),
            this.batchConfiguration.transferAggregateSeconds
        );

        this.handle = trigger;
        this.unsubscribe = unsubscribe;
    }

    public onApplicationBootstrap() {
        this.handle();
    }

    public onModuleDestroy() {
        this.unsubscribe();
    }
}
