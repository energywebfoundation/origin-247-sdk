import { CertificateEventType } from '../events/Certificate.events';
import { SynchronizableEvent } from '../repositories/CertificateEvent/CertificateEvent.repository';
import { EventsBatchQueue } from '../synchronize/strategies/batch/events.batch-queue';

describe('EventsBatchQueue', () => {
    describe('#isEmpty', () => {
        it('should return true if no events are on the queue', async () => {
            const events = [];

            const eventsBatchQueue = new EventsBatchQueue(events);

            expect(eventsBatchQueue.isEmpty()).toEqual(true);
        });

        it('should return false if there is one event on queue', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {}
            } as SynchronizableEvent;
            const events = [eventStub];

            const eventsBatchQueue = new EventsBatchQueue(events);

            expect(eventsBatchQueue.isEmpty()).toEqual(false);
        });
        it('should return false if there are two events on queue', async () => {
            const eventStub = {
                id: 0,
                internalCertificateId: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                createdAt: new Date()
            } as SynchronizableEvent;
            const otherEventStup = {
                id: 0,
                internalCertificateId: 1,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                createdAt: new Date()
            } as SynchronizableEvent;
            const events = [eventStub, otherEventStup];

            const eventsBatchQueue = new EventsBatchQueue(events);

            expect(eventsBatchQueue.isEmpty()).toEqual(false);
        });
    });

    describe('#popBatch', () => {
        it('should return empty array if there are no events', async () => {
            const events = [];

            const eventsBatchQueue = new EventsBatchQueue(events);

            expect(eventsBatchQueue.popBatch()).toEqual([]);
        });

        it('should return all events if they are for different certificates', async () => {
            const eventStub = {
                id: 0,
                internalCertificateId: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                createdAt: new Date()
            } as SynchronizableEvent;
            const otherEventStup = {
                id: 0,
                internalCertificateId: 1,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                createdAt: new Date()
            } as SynchronizableEvent;
            const events = [eventStub, otherEventStup];

            const eventsBatchQueue = new EventsBatchQueue(events);

            expect(eventsBatchQueue.popBatch()).toEqual([eventStub, otherEventStup]);
        });

        it('should return only first event if they are for the same certificate', async () => {
            const eventStub = {
                id: 0,
                internalCertificateId: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                createdAt: new Date(1)
            } as SynchronizableEvent;
            const earlierEvent = {
                id: 0,
                internalCertificateId: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                createdAt: new Date(0)
            } as SynchronizableEvent;
            const events = [eventStub, earlierEvent];

            const eventsBatchQueue = new EventsBatchQueue(events);

            expect(eventsBatchQueue.popBatch()).toEqual([earlierEvent]);
        });
    });

    describe('#removeEventsForCertificateIds', () => {
        it('should return remove all events if they are for the same certificate', async () => {
            let internalCertificateId = 0;
            const eventStub = {
                id: 0,
                internalCertificateId,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                createdAt: new Date()
            } as SynchronizableEvent;
            const otherEventStup = {
                id: 0,
                internalCertificateId,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                createdAt: new Date()
            } as SynchronizableEvent;
            const events = [eventStub, otherEventStup];
            const eventsBatchQueue = new EventsBatchQueue(events);

            eventsBatchQueue.removeEventsForCertificateIds([internalCertificateId]);

            expect(eventsBatchQueue.isEmpty()).toEqual(true);
        });

        it('should remove only the events for specific certificate', async () => {
            const eventStub = {
                id: 0,
                internalCertificateId: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                createdAt: new Date(1)
            } as SynchronizableEvent;
            const eventForDifferentCertificate = {
                id: 0,
                internalCertificateId: 1,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                createdAt: new Date(0)
            } as SynchronizableEvent;
            const events = [eventStub, eventForDifferentCertificate];
            const eventsBatchQueue = new EventsBatchQueue(events);

            eventsBatchQueue.removeEventsForCertificateIds([0]);

            expect(eventsBatchQueue.popBatch()).toEqual([eventForDifferentCertificate]);
        });
    });
});
