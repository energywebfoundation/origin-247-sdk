import { EventsHandler, IEventHandler, IEvent } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BatchConfiguration, BATCH_CONFIGURATION_TOKEN } from './configuration';
import { ValidateService } from '../validate.service';
import { queueThrottle } from './queueThrottle';

export class AwaitingValidationEvent implements IEvent {}

@EventsHandler(AwaitingValidationEvent)
export class AwaitingValidationEventHandler implements IEventHandler<AwaitingValidationEvent> {
    constructor(
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration,
        private validateService: ValidateService
    ) {}

    public handle = queueThrottle<AwaitingValidationEvent>(
        () => this.validateService.validateTask(),
        this.batchConfiguration.validateAggregateSeconds
    );
}
