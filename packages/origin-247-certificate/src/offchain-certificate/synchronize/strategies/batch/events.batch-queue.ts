import { SynchronizableEvent } from '../../../repositories/CertificateEvent/CertificateEvent.repository';
import { flatten } from 'lodash';

type CertificateId = number;

export class EventsBatchQueue {
    private eventsToProcess: Record<CertificateId, SynchronizableEvent[]> = {};

    constructor(events: SynchronizableEvent[]) {
        const sortedEvents = events.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        sortedEvents.forEach((event) => {
            const eventsForThatCertificate = this.eventsToProcess[event.internalCertificateId];
            if (eventsForThatCertificate) {
                this.eventsToProcess[event.internalCertificateId] = [
                    ...eventsForThatCertificate,
                    event
                ];
            } else {
                this.eventsToProcess[event.internalCertificateId] = [event];
            }
        });
    }

    public popBatch(): SynchronizableEvent[] {
        const eventsToProcess: SynchronizableEvent[] = [];

        Object.entries(this.eventsToProcess).forEach(([certificateId, eventsForCertificate]) => {
            const [firstEvent, ...otherEvents] = eventsForCertificate;
            this.eventsToProcess[certificateId] = otherEvents;
            eventsToProcess.push(firstEvent);
        });

        return eventsToProcess;
    }

    public isEmpty(): boolean {
        return flatten(Object.values(this.eventsToProcess)).length === 0;
    }

    public removeEventsForCertificateIds(internalCertificateIds: number[]): void {
        internalCertificateIds.forEach((internalCertificateId) => {
            delete this.eventsToProcess[internalCertificateId];
        });
    }
}
