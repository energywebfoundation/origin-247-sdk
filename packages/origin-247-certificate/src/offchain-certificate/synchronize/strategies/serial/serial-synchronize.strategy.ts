import { SynchronizeStrategy } from '../synchronize.strategy';
import { SynchronizableEvent } from '../../../repositories/CertificateEvent/CertificateEvent.repository';
import { Injectable } from '@nestjs/common';
import { SynchronizeManager } from '../../handlers/synchronize.manager';

@Injectable()
export class SerialSynchronizeStrategy implements SynchronizeStrategy {
    constructor(private readonly synchronizeManager: SynchronizeManager) {}

    async synchronize(events: SynchronizableEvent[]): Promise<void> {
        const sortedEvents = events.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        const failedCertificateIds: number[] = [];

        for (const event of sortedEvents) {
            if (failedCertificateIds.includes(event.internalCertificateId)) {
                continue;
            }

            const { success } = await this.synchronizeManager.handle(event);

            if (!success) {
                failedCertificateIds.push(event.internalCertificateId);
            }
        }
    }
}
