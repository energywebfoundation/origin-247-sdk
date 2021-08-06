import { EventsHandler, IEventHandler, IEvent } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BatchConfiguration, BATCH_CONFIGURATION_TOKEN } from './configuration';
import { IssueService } from '../issue.service';
import { queueThrottle } from './queueThrottle';

export class AwaitingIssuanceEvent implements IEvent {}

@EventsHandler(AwaitingIssuanceEvent)
export class AwaitingIssuanceEventHandler implements IEventHandler<AwaitingIssuanceEvent> {
    constructor(
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration,
        private issueService: IssueService
    ) {}

    public handle = queueThrottle<AwaitingIssuanceEvent>(
        () => this.issueService.issueTask(),
        this.batchConfiguration.issueAggregateSeconds
    );
}
