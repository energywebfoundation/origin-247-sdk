import { EventsHandler, IEventHandler, QueryBus, EventBus } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GenerationReadingStoredEvent } from '../events/GenerationReadingStored.event';
import { IssueService } from '../issue.service';
import { AwaitingIssuanceEvent } from '../batch/events';
import {
    EnergyTransferRequestRepository,
    ENERGY_TRANSFER_REQUEST_REPOSITORY
} from '../repositories';
import {
    GetTransferSitesQuery,
    IGetTransferSitesQueryResponse
} from '../queries/GetTransferSites.query';

@EventsHandler(GenerationReadingStoredEvent)
export class GenerationReadingStoredEventHandler
    implements IEventHandler<GenerationReadingStoredEvent> {
    private readonly logger = new Logger(IssueService.name);

    constructor(
        @Inject(ENERGY_TRANSFER_REQUEST_REPOSITORY)
        private etrRepository: EnergyTransferRequestRepository,
        private queryBus: QueryBus,
        private eventBus: EventBus
    ) {}

    /**
     * This logic could be in the IssueService, but this would lead to
     * dependency loop on EventBus and EventHandler level (interesting case)
     */
    async handle(event: GenerationReadingStoredEvent) {
        const { generatorId, energyValue, transferDate, fromTime, toTime, metadata } = event.data;

        const sites: IGetTransferSitesQueryResponse | null = await this.queryBus.execute(
            new GetTransferSitesQuery({ generatorId })
        );

        if (!sites) {
            this.logger.log(`No sites queries for ${generatorId}`);
            return;
        }

        await this.etrRepository.createNew({
            buyerAddress: sites.buyerAddress,
            sellerAddress: sites.sellerAddress,
            volume: energyValue,
            transferDate,
            certificateData: {
                generatorId,
                fromTime: fromTime.toISOString(),
                toTime: toTime.toISOString(),
                metadata
            }
        });

        this.eventBus.publish(new AwaitingIssuanceEvent());
    }
}
