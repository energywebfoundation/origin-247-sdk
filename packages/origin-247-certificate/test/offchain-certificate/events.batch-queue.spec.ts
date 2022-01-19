import {
    CertificateEventType,
    ICertificateEvent
} from '../../src/offchain-certificate/events/Certificate.events';
import { EventsBatchQueue } from '../../src/offchain-certificate/synchronize/strategies/batch/events.batch-queue';

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
                payload: {},
                version: 1,
                createdAt: new Date('2020-01-01T01:00:00.000Z'),
                internalCertificateId: 1
            } as ICertificateEvent;
            const events = [eventStub];

            const eventsBatchQueue = new EventsBatchQueue(events);

            expect(eventsBatchQueue.isEmpty()).toEqual(false);
        });
        it('should return false if there are two events on queue', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                version: 1,
                createdAt: new Date('2020-01-01T01:00:00.000Z'),
                internalCertificateId: 1
            } as ICertificateEvent;
            const otherEventStub = {
                id: 1,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                version: 1,
                createdAt: new Date('2020-01-01T01:00:00.000Z'),
                internalCertificateId: 2
            } as ICertificateEvent;
            const events = [eventStub, otherEventStub];

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

        it('should return empty array if there are no events after processing everything', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                version: 1,
                createdAt: new Date('2020-01-01T01:00:00.000Z'),
                internalCertificateId: 1
            } as ICertificateEvent;
            const events = [eventStub];

            const eventsBatchQueue = new EventsBatchQueue(events);

            expect(eventsBatchQueue.popBatch()).toEqual([eventStub]);
            expect(eventsBatchQueue.popBatch()).toEqual([]);
        });

        it('should return all events if they are for different certificates', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                version: 1,
                createdAt: new Date('2020-01-01T01:00:00.000Z'),
                internalCertificateId: 1
            } as ICertificateEvent;
            const otherEventStup = {
                id: 1,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                version: 1,
                createdAt: new Date('2020-01-01T01:00:00.000Z'),
                internalCertificateId: 2
            } as ICertificateEvent;
            const events = [eventStub, otherEventStup];

            const eventsBatchQueue = new EventsBatchQueue(events);

            expect(eventsBatchQueue.popBatch()).toEqual([eventStub, otherEventStup]);
        });

        it('should return only first event if they are for the same certificate', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                version: 1,
                createdAt: new Date('2020-01-01T01:30:00.000Z'),
                internalCertificateId: 1
            } as ICertificateEvent;
            const earlierEvent = {
                id: 1,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                version: 1,
                createdAt: new Date('2020-01-01T01:00:00.000Z'),
                internalCertificateId: 1
            } as ICertificateEvent;
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
                version: 1,
                createdAt: new Date('2020-01-01T01:00:00.000Z')
            } as ICertificateEvent;
            const otherEventStup = {
                id: 1,
                internalCertificateId,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                version: 1,
                createdAt: new Date('2020-01-01T01:00:00.000Z')
            } as ICertificateEvent;
            const events = [eventStub, otherEventStup];
            const eventsBatchQueue = new EventsBatchQueue(events);

            eventsBatchQueue.removeEventsForCertificateIds([internalCertificateId]);

            expect(eventsBatchQueue.isEmpty()).toEqual(true);
        });

        it('should remove only the events for specific certificate', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                version: 1,
                createdAt: new Date('2020-01-01T01:00:00.000Z'),
                internalCertificateId: 1
            } as ICertificateEvent;
            const eventForDifferentCertificate = {
                id: 1,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {},
                version: 1,
                createdAt: new Date('2020-01-01T01:00:00.000Z'),
                internalCertificateId: 2
            } as ICertificateEvent;
            const events = [eventStub, eventForDifferentCertificate];
            const eventsBatchQueue = new EventsBatchQueue(events);

            eventsBatchQueue.removeEventsForCertificateIds([1]);

            expect(eventsBatchQueue.popBatch()).toEqual([eventForDifferentCertificate]);
        });
    });
});
