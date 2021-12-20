import { bootstrapTestInstance } from './setup';
import { INestApplication } from '@nestjs/common';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { CertificateEventRepository } from '../src/offchain-certificate/repositories/CertificateEvent/CertificateEvent.repository';
// import { CertificateService } from '../src';
import {
    CertificateIssuancePersistedEvent,
    CertificateIssuedEvent,
    CertificateTransferredEvent
} from '../src/offchain-certificate/events/Certificate.events';
import { IIssuancePersistedCommand, IIssueCommand } from '../src';

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

    describe.only('#getAllNotProcessed', function () {
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

        const createIssuancePersistedCommand = (): IIssuancePersistedCommand => ({
            blockchainCertificateId: 0
        });

        it('should return events no events when all are persisted', async () => {
            for (const event of [
                new CertificateIssuedEvent(1, createIssueCommand()),
                new CertificateIssuancePersistedEvent(1, createIssuancePersistedCommand())
            ]) {
                await certificateEventRepository.save(event, 0);
            }

            const certs = await certificateEventRepository.getAllNotProcessed();
            expect(certs).toHaveLength(0);
        });
    });
});
