import { SynchronizeStrategy } from '../synchronize.strategy';
import { SynchronizableEvent } from '../../../repositories/CertificateEvent/CertificateEvent.repository';
import { Injectable } from '@nestjs/common';
import { PersistProcessor } from '../../handlers/persist.handler';
import { CertificateEventType } from '../../../events/Certificate.events';

@Injectable()
export class BatchSynchronizeStrategy implements SynchronizeStrategy {
    constructor(private readonly persistProcessor: PersistProcessor) {}

    async synchronize(events: SynchronizableEvent[]): Promise<void> {
        const failedCertificateIds: number[] = [];
        const hasNotFailedBefore = (e: SynchronizableEvent) =>
            !failedCertificateIds.includes(e.internalCertificateId);

        // Batch issue certificates
        const issueEvents = events.filter((e) => e.type === CertificateEventType.Issued);
        if (issueEvents.length) {
            const issueResult = await this.persistProcessor.handleBatch(issueEvents);
            failedCertificateIds.push(...issueResult.failedCertificateIds);
        }

        // Batch claim certificates
        const claimEvents = events
            .filter((e) => e.type === CertificateEventType.Claimed)
            .filter(hasNotFailedBefore);
        if (claimEvents.length) {
            const claimResult = await this.persistProcessor.handleBatch(claimEvents);
            failedCertificateIds.push(...claimResult.failedCertificateIds);
        }

        // Batch transfer certificates
        const transferEvents = events
            .filter((e) => e.type === CertificateEventType.Transferred)
            .filter(hasNotFailedBefore);
        if (transferEvents.length) {
            await this.persistProcessor.handleBatch(transferEvents);
        }
    }
}
