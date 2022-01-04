import { SynchronizeStrategy } from '../synchronize.strategy';
import { SynchronizableEvent } from '../../../repositories/CertificateEvent/CertificateEvent.repository';
import { Injectable } from '@nestjs/common';
import { SynchronizeManager } from '../../handlers/synchronize.manager';
import { EventsBatchQueue } from './events.batch-queue';
import { CertificateEventType } from '../../../events/Certificate.events';

@Injectable()
export class BatchSynchronizeStrategy implements SynchronizeStrategy {
    constructor(private readonly synchronizeManager: SynchronizeManager) {}

    async synchronize(events: SynchronizableEvent[]): Promise<void> {
        const failedCertificateIds: number[] = [];
        const hasNotFailedBefore = (e: SynchronizableEvent) =>
            !failedCertificateIds.includes(e.internalCertificateId);
        const eventsBatchQueue = new EventsBatchQueue(events);

        while (!eventsBatchQueue.isEmpty()) {
            const batch = eventsBatchQueue.popBatch();

            // Batch issue certificates
            const issueEvents = batch
                .filter((e) => e.type === CertificateEventType.Issued)
                .filter(hasNotFailedBefore);
            if (issueEvents.length) {
                const issueResult = await this.synchronizeManager.handleBatch(issueEvents);
                failedCertificateIds.push(...issueResult.failedCertificateIds);
                eventsBatchQueue.removeEventsForCertificateIds(issueResult.failedCertificateIds);
            }

            // Batch transfer certificates
            const transferEvents = batch
                .filter((e) => e.type === CertificateEventType.Transferred)
                .filter(hasNotFailedBefore);
            if (transferEvents.length) {
                const transferResult = await this.synchronizeManager.handleBatch(transferEvents);
                eventsBatchQueue.removeEventsForCertificateIds(transferResult.failedCertificateIds);
            }

            // Batch claim certificates
            const claimEvents = batch
                .filter((e) => e.type === CertificateEventType.Claimed)
                .filter(hasNotFailedBefore);
            if (claimEvents.length) {
                const claimResult = await this.synchronizeManager.handleBatch(claimEvents);
                failedCertificateIds.push(...claimResult.failedCertificateIds);
                eventsBatchQueue.removeEventsForCertificateIds(claimResult.failedCertificateIds);
            }
        }
    }
}
