import { Test } from '@nestjs/testing';
import { CERTIFICATE_EVENT_REPOSITORY } from '../repositories/repository.keys';
import { TransferPersistHandler } from '../synchronize/handlers/transfer-persist.handler';
import { CertificateEventType } from '../events/Certificate.events';
import { CertificateEventEntity } from '../repositories/CertificateEvent/CertificateEvent.entity';
import {
    BATCH_CONFIGURATION_TOKEN,
    batchConfiguration
} from '../synchronize/strategies/batch/batch.configuration';
import { ONCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../..';
import { OffChainCertificateService } from '../offchain-certificate.service';

describe('TransferPersistHandler', () => {
    let transferPersistHandler: TransferPersistHandler;
    const certEventRepoMock = {};

    const offchainCertificateServiceMock = {
        persistError: jest.fn(),
        transferPersisted: jest.fn()
    };

    const certificateServiceMock = {
        transfer: jest.fn(),
        batchTransfer: jest.fn()
    };

    beforeEach(async () => {
        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: ONCHAIN_CERTIFICATE_SERVICE_TOKEN,
                    useValue: certificateServiceMock
                },
                {
                    provide: OffChainCertificateService,
                    useValue: offchainCertificateServiceMock
                },
                {
                    provide: CERTIFICATE_EVENT_REPOSITORY,
                    useValue: certEventRepoMock
                },
                {
                    provide: BATCH_CONFIGURATION_TOKEN,
                    useValue: batchConfiguration
                },
                TransferPersistHandler
            ]
        }).compile();

        transferPersistHandler = app.get(TransferPersistHandler);
    });

    const createEvent = (values: Partial<CertificateEventEntity> = {}): CertificateEventEntity => ({
        type: CertificateEventType.Transferred,
        commandId: 0,
        internalCertificateId: 0,
        id: 0,
        createdAt: new Date(),
        payload: {},
        version: 0,
        ...values
    });

    describe('#canHandle', () => {
        it('should return true for transfered event type', () => {
            let event = createEvent({ type: CertificateEventType.Transferred });

            const canHandle = transferPersistHandler.canHandle(event);

            expect(canHandle).toEqual(true);
        });

        it.each(
            Object.values(CertificateEventType)
                .filter((type) => type !== CertificateEventType.Transferred)
                .map((eventType) => [eventType])
        )('should return false for %s event type', (eventType) => {
            const event = createEvent({ type: eventType });

            const canHandle = transferPersistHandler.canHandle(event);

            expect(canHandle).toEqual(false);
        });
    });

    describe('#handle', () => {
        it('should trigger transfer persisted if transfer was successful', async () => {
            const event = createEvent();
            certificateServiceMock.transfer.mockResolvedValueOnce({ success: true });

            await transferPersistHandler.handle(event);

            expect(offchainCertificateServiceMock.persistError).toBeCalledTimes(0);
            expect(certificateServiceMock.transfer).toBeCalledTimes(1);
            expect(certificateServiceMock.transfer).toBeCalledWith(event.payload);
            expect(offchainCertificateServiceMock.transferPersisted).toBeCalledTimes(1);
            expect(offchainCertificateServiceMock.transferPersisted).toBeCalledWith(
                event.internalCertificateId,
                {}
            );
        });

        it('should report persist error if synchronization failed', async () => {
            const event = createEvent();
            certificateServiceMock.transfer.mockResolvedValueOnce({ success: false });

            await transferPersistHandler.handle(event);

            expect(certificateServiceMock.transfer).toBeCalledTimes(1);
            expect(certificateServiceMock.transfer).toBeCalledWith(event.payload);
            expect(offchainCertificateServiceMock.transferPersisted).toBeCalledTimes(0);
            expect(offchainCertificateServiceMock.persistError).toBeCalledTimes(1);
            expect(
                offchainCertificateServiceMock.persistError
            ).toBeCalledWith(event.internalCertificateId, { errorMessage: expect.any(String) });
        });
    });

    describe('#handleBatch', () => {
        it('should trigger transfer persisted for all events if batchTransfer was successful', async () => {
            const event = createEvent();
            certificateServiceMock.batchTransfer.mockResolvedValueOnce({ success: true });

            await transferPersistHandler.handleBatch([event, event]);

            expect(offchainCertificateServiceMock.persistError).toBeCalledTimes(0);
            expect(certificateServiceMock.batchTransfer).toBeCalledTimes(1);
            expect(certificateServiceMock.batchTransfer).toBeCalledWith([
                event.payload,
                event.payload
            ]);
            expect(offchainCertificateServiceMock.transferPersisted).toBeCalledTimes(2);
            expect(offchainCertificateServiceMock.transferPersisted).nthCalledWith(
                1,
                event.internalCertificateId,
                {}
            );
            expect(offchainCertificateServiceMock.transferPersisted).nthCalledWith(
                2,
                event.internalCertificateId,
                {}
            );
        });

        it('should report persist error for all events if synchronization failed', async () => {
            const event = createEvent();
            certificateServiceMock.batchTransfer.mockResolvedValueOnce({ success: false });

            await transferPersistHandler.handleBatch([event, event]);

            expect(offchainCertificateServiceMock.transferPersisted).toBeCalledTimes(0);
            expect(certificateServiceMock.batchTransfer).toBeCalledTimes(1);
            expect(certificateServiceMock.batchTransfer).toBeCalledWith([
                event.payload,
                event.payload
            ]);
            expect(offchainCertificateServiceMock.persistError).toBeCalledTimes(2);
            expect(offchainCertificateServiceMock.persistError).nthCalledWith(
                1,
                event.internalCertificateId,
                { errorMessage: expect.any(String) }
            );
            expect(offchainCertificateServiceMock.persistError).nthCalledWith(
                2,
                event.internalCertificateId,
                { errorMessage: expect.any(String) }
            );
        });
    });
});
