import { bootstrapTestInstance } from '../setup';
import { INestApplication } from '@nestjs/common';
import { CertificateEventRepository } from '../../src/offchain-certificate/repositories/CertificateEvent/CertificateEvent.repository';
import {
    CertificateClaimedEvent,
    CertificateIssuancePersistedEvent,
    CertificateIssuedEvent,
    CertificateTransferredEvent,
    ICertificateEvent
} from '../../src/offchain-certificate/events/Certificate.events';
import { IIssuancePersistedCommand } from '../../src/offchain-certificate/types';
import { IClaimCommand, IIssueCommand, ITransferCommand } from '../../src';
import { CertificateEventService } from '../../src/offchain-certificate/repositories/CertificateEvent/CertificateEvent.service';

jest.setTimeout(20 * 1000);
process.env.CERTIFICATE_QUEUE_DELAY = '1000';

describe('CertificateEventRepository', () => {
    let app: INestApplication;
    let cleanDB: () => Promise<void>;
    let certificateEventRepository: CertificateEventRepository;
    let certificateEventService: CertificateEventService;

    beforeAll(async () => {
        ({
            app,
            cleanDB,
            certificateEventRepository,
            certificateEventService
        } = await bootstrapTestInstance());

        await app.init();
    });

    afterAll(async () => {
        await cleanDB();
        await app.close();
    });

    afterEach(async () => {
        await cleanDB();
    });

    it('should return no certificates', async () => {
        const certs = await certificateEventRepository.getAll();
        expect(certs).toHaveLength(0);
    });

    it('should create a certificateEvent', async () => {
        const event = CertificateIssuedEvent.createNew(1, {
            toAddress: '0x1',
            toTime: new Date().getTime(),
            fromTime: new Date().getTime(),
            energyValue: '100',
            userId: 'user1',
            deviceId: 'asdf',
            metadata: {}
        });
        await certificateEventService.save(event, 1);
        const certs = await certificateEventRepository.getAll();
        expect(certs).toHaveLength(1);
    });

    it('should find by id', async () => {
        const event = CertificateIssuedEvent.createNew(1, {
            toAddress: '0x1',
            toTime: new Date().getTime(),
            fromTime: new Date().getTime(),
            energyValue: '100',
            userId: 'user1',
            deviceId: 'asdf',
            metadata: {}
        });
        const otherEvent = CertificateTransferredEvent.createNew(1, {
            toAddress: '0x1',
            certificateId: 1,
            energyValue: '100',
            fromAddress: '0x2'
        });
        const differentEvent = CertificateIssuedEvent.createNew(2, {
            toAddress: '0x1',
            toTime: new Date().getTime(),
            fromTime: new Date().getTime(),
            energyValue: '100',
            userId: 'user1',
            deviceId: 'asdf',
            metadata: {}
        });
        await certificateEventService.save(event, 1);
        await certificateEventService.save(otherEvent, 2);
        await certificateEventService.save(differentEvent, 3);

        const certs = await certificateEventRepository.getByInternalCertificateId(1);

        expect(certs).toHaveLength(2);
    });

    it('should return the number of issued certificates', async () => {
        let issuedCerts = await certificateEventRepository.getNumberOfCertificates();
        expect(issuedCerts).toBe(0);

        const event = CertificateIssuedEvent.createNew(issuedCerts + 1, {
            toAddress: '0x1',
            toTime: new Date().getTime(),
            fromTime: new Date().getTime(),
            energyValue: '100',
            userId: 'user1',
            deviceId: 'asdf',
            metadata: {}
        });
        await certificateEventService.save(event, 1);
        issuedCerts = await certificateEventRepository.getNumberOfCertificates();
        expect(issuedCerts).toBe(1);

        const otherEvent = CertificateTransferredEvent.createNew(1, {
            toAddress: '0x1',
            certificateId: 1,
            energyValue: '100',
            fromAddress: '0x2'
        });
        await certificateEventService.save(otherEvent, 2);

        issuedCerts = await certificateEventRepository.getNumberOfCertificates();
        expect(issuedCerts).toBe(1);

        const anotherEvent = CertificateIssuedEvent.createNew(issuedCerts + 1, {
            toAddress: '0x1',
            toTime: new Date().getTime(),
            fromTime: new Date().getTime(),
            energyValue: '100',
            userId: 'user1',
            deviceId: 'asdf',
            metadata: {}
        });
        await certificateEventService.save(anotherEvent, 3);
        issuedCerts = await certificateEventRepository.getNumberOfCertificates();
        expect(issuedCerts).toBe(2);
    });

    describe('#getAllNotProcessed', () => {
        it('should return empty list for no events to process', async () => {
            const certs = await certificateEventRepository.getAllNotProcessed();
            expect(certs).toHaveLength(0);
        });

        const createIssueCommand = (): IIssueCommand<unknown> => ({
            toAddress: '0x1',
            toTime: new Date().getTime(),
            fromTime: new Date().getTime(),
            energyValue: '100',
            userId: 'user1',
            deviceId: 'asdf',
            metadata: {}
        });

        const createClaimCommand = (): IClaimCommand => ({
            certificateId: 1,
            claimData: {
                beneficiary: 'someBeneficiary',
                location: 'Radom',
                countryCode: 'PL',
                periodStartDate: '2021-11-18T08:00:00.000Z',
                periodEndDate: '2021-11-18T08:30:00.000Z',
                purpose: 'higher'
            },
            forAddress: '0x1',
            energyValue: '100'
        });

        const createTransferCommand = (): ITransferCommand => ({
            certificateId: 1,
            fromAddress: '0x0',
            toAddress: '0x2',
            energyValue: '100'
        });

        const prepareEvents = async (...events: ICertificateEvent[]) => {
            const savedEvents: ICertificateEvent[] = [];

            for (const event of events) {
                const savedEvent = await certificateEventService.save(event, 0);
                savedEvents.push(savedEvent);
            }

            return savedEvents;
        };

        it('should return no events when all are persisted', async () => {
            const [event] = await prepareEvents(
                CertificateIssuedEvent.createNew(1, createIssueCommand())
            );
            await certificateEventRepository.updateAttempt({
                eventId: event.id
            });

            const certs = await certificateEventRepository.getAllNotProcessed();
            expect(certs).toHaveLength(0);
        });

        it('should return events with error if they did not exceed retry attempts limit', async () => {
            const [event] = await prepareEvents(
                CertificateIssuedEvent.createNew(1, createIssueCommand())
            );
            await certificateEventRepository.updateAttempt({
                eventId: event.id,
                error: 'error'
            });

            const certs = await certificateEventRepository.getAllNotProcessed();
            expect(certs).toHaveLength(1);
        });

        it('should return no events when error occurred on them', async () => {
            const [event] = await prepareEvents(
                CertificateIssuedEvent.createNew(1, createIssueCommand())
            );

            // Prepare 3 failed tries

            await certificateEventRepository.updateAttempt({
                eventId: event.id,
                error: 'some error'
            });

            await certificateEventRepository.updateAttempt({
                eventId: event.id,
                error: 'some error'
            });

            await certificateEventRepository.updateAttempt({
                eventId: event.id,
                error: 'some error'
            });

            const certs = await certificateEventRepository.getAllNotProcessed();

            expect(certs).toHaveLength(0);
        });

        it('should return issue events when they are not processed', async () => {
            await prepareEvents(CertificateIssuedEvent.createNew(1, createIssueCommand()));

            const certs = await certificateEventRepository.getAllNotProcessed();

            expect(certs).toHaveLength(1);
        });

        it('should return claim events when they are not processed', async () => {
            await prepareEvents(CertificateClaimedEvent.createNew(1, createClaimCommand()));

            const certs = await certificateEventRepository.getAllNotProcessed();

            expect(certs).toHaveLength(1);
        });

        it('should return transfer events when they are not processed', async () => {
            await prepareEvents(CertificateTransferredEvent.createNew(1, createTransferCommand()));

            const certs = await certificateEventRepository.getAllNotProcessed();

            expect(certs).toHaveLength(1);
        });
    });

    describe('#getBlockchainIdMap', () => {
        it('should properly return id map', async () => {
            const createIssuePersistedCommand = (id: number): IIssuancePersistedCommand => ({
                blockchainCertificateId: id,
                persistedEventId: 1,
                transactionHash: ''
            });

            await certificateEventService.save(
                CertificateIssuancePersistedEvent.createNew(1, createIssuePersistedCommand(10)),
                0
            );

            await certificateEventService.save(
                CertificateIssuancePersistedEvent.createNew(2, createIssuePersistedCommand(20)),
                0
            );

            const idMap = await certificateEventRepository.getBlockchainIdMap([1, 2, 3]);

            expect(Object.entries(idMap)).toHaveLength(2);
            expect(idMap[1]).toBe(10);
            expect(idMap[2]).toBe(20);
        });
    });
});
