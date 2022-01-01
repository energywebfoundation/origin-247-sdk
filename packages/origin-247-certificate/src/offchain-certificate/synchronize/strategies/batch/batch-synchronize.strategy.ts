import { SynchronizeStrategy } from '../synchronize.strategy';
import { SynchronizableEvent } from '../../../repositories/CertificateEvent/CertificateEvent.repository';
import { Injectable } from '@nestjs/common';
import { CertificateEventType } from '../../../events/Certificate.events';
import { SynchronizeManager } from '../../handlers/synchronize.manager';

@Injectable()
export class BatchSynchronizeStrategy implements SynchronizeStrategy {
    constructor(private readonly synchronizeManager: SynchronizeManager) {}

    async synchronize(events: SynchronizableEvent[]): Promise<void> {
        const failedCertificateIds: number[] = [];
        const hasNotFailedBefore = (e: SynchronizableEvent) =>
            !failedCertificateIds.includes(e.internalCertificateId);

        type CertificateId = number;
        const eventsToProcess: Record<CertificateId, SynchronizableEvent[]> = {};

        // Batch issue certificates
        const issueEvents = events.filter((e) => e.type === CertificateEventType.Issued);
        if (issueEvents.length) {
            const issueResult = await this.synchronizeManager.handleBatch(issueEvents);
            failedCertificateIds.push(...issueResult.failedCertificateIds);
        }

        // Batch transfer certificates
        const transferEvents = events
            .filter((e) => e.type === CertificateEventType.Transferred)
            .filter(hasNotFailedBefore);
        if (transferEvents.length) {
            await this.synchronizeManager.handleBatch(transferEvents);
        }

        // Batch claim certificates
        const claimEvents = events
            .filter((e) => e.type === CertificateEventType.Claimed)
            .filter(hasNotFailedBefore);
        if (claimEvents.length) {
            const claimResult = await this.synchronizeManager.handleBatch(claimEvents);
            failedCertificateIds.push(...claimResult.failedCertificateIds);
        }
    }
}
