import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BatchConfiguration, BATCH_CONFIGURATION_TOKEN } from './configuration';
import { ValidateService } from '../validate.service';
import { queueThrottle } from './queueThrottle';
import { AwaitingValidationEvent } from './events';

@EventsHandler(AwaitingValidationEvent)
export class AwaitingValidationEventHandler implements IEventHandler<AwaitingValidationEvent> {
    public handle: VoidFunction;
    private unsubscribe: VoidFunction;

    constructor(
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration,
        private validateService: ValidateService
    ) {
        const { trigger, unsubscribe } = queueThrottle(
            () => this.validateService.validateTask(),
            this.batchConfiguration.validateAggregateSeconds
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
