import { SynchronizeStrategy } from '../synchronize.strategy';
import { CertificateEventRepository } from '../../../repositories/CertificateEvent/CertificateEvent.repository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventsBatchQueue } from './events.batch-queue';
import {
    isTransferEvent,
    isClaimEvent,
    isIssueEvent,
    ICertificateEvent
} from '../../../events/Certificate.events';
import { CERTIFICATE_EVENT_REPOSITORY } from '../../../repositories/repository.keys';
import { ClaimPersistHandler } from '../../handlers/claim-persist.handler';
import { IssuePersistHandler } from '../../handlers/issue-persist.handler';
import { TransferPersistHandler } from '../../handlers/transfer-persist.handler';
import { partition } from 'lodash';

@Injectable()
export class BatchSynchronizeStrategy implements SynchronizeStrategy {
    private logger = new Logger(BatchSynchronizeStrategy.name);

    constructor(
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private eventRepository: CertificateEventRepository,
        private claimPersistHandler: ClaimPersistHandler,
        private issuancePersistHandler: IssuePersistHandler,
        private transferPersistHandler: TransferPersistHandler
    ) {}

    async synchronize(events: ICertificateEvent[]): Promise<void> {
        const failedCertificateIds: number[] = [];
        const hasCertificateFailed = (certificateId: number) =>
            failedCertificateIds.includes(certificateId);
        const eventsBatchQueue = new EventsBatchQueue(events);

        while (!eventsBatchQueue.isEmpty()) {
            const batch = eventsBatchQueue.popBatch();
            const issueEvents = batch.filter(isIssueEvent);
            const transferEvents = batch.filter(isTransferEvent);
            const claimEvents = batch.filter(isClaimEvent);

            // Batch issue certificates
            const issueResult = await this.issuancePersistHandler.handleBatch(
                issueEvents.filter((e) => !hasCertificateFailed(e.internalCertificateId))
            );
            failedCertificateIds.push(...issueResult.failedCertificateIds);
            eventsBatchQueue.removeEventsForCertificateIds(issueResult.failedCertificateIds);

            // Batch transfer certificates
            const {
                events: transferEventsWithBlockchainId,
                idMap: transferIdMap
            } = await this.getEventsWithBlockchainId(
                transferEvents.filter((e) => !hasCertificateFailed(e.internalCertificateId))
            );

            const transferResult = await this.transferPersistHandler.handleBatch(
                transferEventsWithBlockchainId,
                transferIdMap
            );
            eventsBatchQueue.removeEventsForCertificateIds(transferResult.failedCertificateIds);

            // Batch claim certificates
            const {
                events: claimEventsWithBlockchainId,
                idMap: claimIdMap
            } = await this.getEventsWithBlockchainId(
                claimEvents.filter((e) => !hasCertificateFailed(e.internalCertificateId))
            );
            const claimResult = await this.claimPersistHandler.handleBatch(
                claimEventsWithBlockchainId,
                claimIdMap
            );
            failedCertificateIds.push(...claimResult.failedCertificateIds);
            eventsBatchQueue.removeEventsForCertificateIds(claimResult.failedCertificateIds);
        }
    }

    private async getEventsWithBlockchainId<T extends ICertificateEvent>(
        events: T[]
    ): Promise<{
        events: T[];
        idMap: Record<number, number>;
    }> {
        const idMap = await this.eventRepository.getBlockchainIdMap(
            events.map((e) => e.internalCertificateId)
        );

        const [eventsWithBlockchainId, eventsWithoutBlockchainId] = partition(
            events,
            (e) => idMap[e.internalCertificateId] !== undefined
        );

        if (eventsWithoutBlockchainId.length > 0) {
            this.logger.error(
                `Cannot synchronize events: ${eventsWithoutBlockchainId
                    .map((e) => e.id)
                    .join(', ')}, because they don't have blockchain ID`
            );
        }

        return {
            events: eventsWithBlockchainId,
            idMap
        };
    }
}
