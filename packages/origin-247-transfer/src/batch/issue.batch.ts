import { EventsHandler, IEventHandler, IEvent } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BatchConfiguration, BATCH_CONFIGURATION_TOKEN } from './configuration';
import { IssueService } from '../issue.service';
import { queueThrottle } from './queueThrottle';

export class AwaitingIssuanceEvent implements IEvent {}

@EventsHandler(AwaitingIssuanceEvent)
export class AwaitingIssuanceEventHandler implements IEventHandler<AwaitingIssuanceEvent> {
    public handle: VoidFunction;
    private unsubscribe: VoidFunction;

    constructor(
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration,
        private issueService: IssueService
    ) {
        const { trigger, unsubscribe } = queueThrottle(
            () => this.issueService.issueTask(),
            this.batchConfiguration.issueAggregateSeconds
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
