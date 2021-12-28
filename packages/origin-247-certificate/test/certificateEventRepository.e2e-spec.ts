import { bootstrapTestInstance } from './setup';
import { INestApplication } from '@nestjs/common';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { CertificateEventRepository } from '../src/offchain-certificate/repositories/CertificateEvent/CertificateEvent.repository';
// import { CertificateService } from '../src';
import {
    CertificateClaimedEvent,
    CertificateIssuancePersistedEvent,
    CertificateIssuedEvent,
    CertificatePersistErrorEvent,
    CertificateTransferredEvent,
    ICertificateEvent
} from '../src/offchain-certificate/events/Certificate.events';
import { IClaimCommand, IIssuancePersistedCommand, IIssueCommand, ITransferCommand } from '../src';

jest.setTimeout(20 * 1000);
process.env.CERTIFICATE_QUEUE_DELAY = '1000';

describe('CertificateEventRepository', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let certificateEventRepository: CertificateEventRepository;

    beforeAll(async () => {
        ({ app, databaseService, certificateEventRepository } = await bootstrapTestInstance());

        await app.init();
    });

    afterAll(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    afterEach(async () => {
        await databaseService.cleanUp();
    });

    it('should return no certificates', async () => {
        const certs = await certificateEventRepository.getAll();
        expect(certs).toHaveLength(0);
    });

    it('should create a certificateEvent', async () => {
        const event = new CertificateIssuedEvent(1, {
            toAddress: '0x1',
            toTime: new Date().getTime(),
            fromTime: new Date().getTime(),
            energyValue: '100',
            userId: 'user1',
            deviceId: 'asdf',
            metadata: {}
        });
        await certificateEventRepository.save(event, 1);
        const certs = await certificateEventRepository.getAll();
        expect(certs).toHaveLength(1);
    });

    it('should find by id', async () => {
        const event = new CertificateIssuedEvent(1, {
            toAddress: '0x1',
            toTime: new Date().getTime(),
            fromTime: new Date().getTime(),
            energyValue: '100',
            userId: 'user1',
            deviceId: 'asdf',
            metadata: {}
        });
        const otherEvent = new CertificateTransferredEvent(1, {
            toAddress: '0x1',
            certificateId: 1,
            energyValue: '100',
            fromAddress: '0x2'
        });
        const differentEvent = new CertificateIssuedEvent(2, {
            toAddress: '0x1',
            toTime: new Date().getTime(),
            fromTime: new Date().getTime(),
            energyValue: '100',
            userId: 'user1',
            deviceId: 'asdf',
            metadata: {}
        });
        await certificateEventRepository.save(event, 1);
        await certificateEventRepository.save(otherEvent, 2);
        await certificateEventRepository.save(differentEvent, 3);

        const certs = await certificateEventRepository.getByInternalCertificateId(1);

        expect(certs).toHaveLength(2);
    });

    it('should return the number of issued certificates', async () => {
        let issuedCerts = await certificateEventRepository.getNumberOfCertificates();
        expect(issuedCerts).toBe(0);

        const event = new CertificateIssuedEvent(issuedCerts + 1, {
            toAddress: '0x1',
            toTime: new Date().getTime(),
            fromTime: new Date().getTime(),
            energyValue: '100',
            userId: 'user1',
            deviceId: 'asdf',
            metadata: {}
        });
        await certificateEventRepository.save(event, 1);
        issuedCerts = await certificateEventRepository.getNumberOfCertificates();
        expect(issuedCerts).toBe(1);

        const otherEvent = new CertificateTransferredEvent(1, {
            toAddress: '0x1',
            certificateId: 1,
            energyValue: '100',
            fromAddress: '0x2'
        });
        await certificateEventRepository.save(otherEvent, 2);

        issuedCerts = await certificateEventRepository.getNumberOfCertificates();
        expect(issuedCerts).toBe(1);

        const anotherEvent = new CertificateIssuedEvent(issuedCerts + 1, {
            toAddress: '0x1',
            toTime: new Date().getTime(),
            fromTime: new Date().getTime(),
            energyValue: '100',
            userId: 'user1',
            deviceId: 'asdf',
            metadata: {}
        });
        await certificateEventRepository.save(anotherEvent, 3);
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

        const createIssuancePersistedCommand = (): IIssuancePersistedCommand => ({
            blockchainCertificateId: 0
        });

        const prepareEvents = async (...events: ICertificateEvent[]) => {
            for (const event of events) {
                await certificateEventRepository.save(event, 0);
            }
        };

        it('should return no events when all are persisted', async () => {
            await prepareEvents(
                new CertificateIssuedEvent(1, createIssueCommand()),
                new CertificateIssuancePersistedEvent(1, createIssuancePersistedCommand())
            );

            const certs = await certificateEventRepository.getAllNotProcessed();
            expect(certs).toHaveLength(0);
        });

        it('should return no events when error occurred on them', async () => {
            await prepareEvents(
                new CertificateIssuedEvent(1, createIssueCommand()),
                new CertificatePersistErrorEvent(1, { errorMessage: 'err0r!' })
            );

            const certs = await certificateEventRepository.getAllNotProcessed();

            expect(certs).toHaveLength(0);
        });

        it('should return issue events when they are not processed', async () => {
            await prepareEvents(new CertificateIssuedEvent(1, createIssueCommand()));

            const certs = await certificateEventRepository.getAllNotProcessed();

            expect(certs).toHaveLength(1);
        });

        it('should return claim events when they are not processed', async () => {
            await prepareEvents(new CertificateClaimedEvent(1, createClaimCommand()));

            const certs = await certificateEventRepository.getAllNotProcessed();

            expect(certs).toHaveLength(1);
        });

        it('should return transfer events when they are not processed', async () => {
            await prepareEvents(new CertificateTransferredEvent(1, createTransferCommand()));

            const certs = await certificateEventRepository.getAllNotProcessed();

            expect(certs).toHaveLength(1);
        });
    });
});