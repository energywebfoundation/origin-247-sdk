import { Test } from '@nestjs/testing';
import { CERTIFICATE_EVENT_REPOSITORY } from '../repositories/repository.keys';
import { CERTIFICATE_SERVICE_TOKEN, OFFCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../../types';
import { ClaimPersistHandler } from '../synchronize/handlers/claim-persist.handler';
import { CertificateEventType } from '../events/Certificate.events';
import { CertificateEventEntity } from '../repositories/CertificateEvent/CertificateEvent.entity';
import { CertificateCommandEntity } from '../repositories/CertificateCommand/CertificateCommand.entity';

describe('ClaimPersistHandler', () => {
    let claimPersistHandler: ClaimPersistHandler;
    const certEventRepoMock = {};

    const offchainCertificateServiceMock = {
        persistError: jest.fn(),
        claimPersisted: jest.fn()
    };

    const certificateServiceMock = {
        claim: jest.fn(),
        batchClaim: jest.fn()
    };

    beforeEach(async () => {
        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: CERTIFICATE_SERVICE_TOKEN,
                    useValue: certificateServiceMock
                },
                {
                    provide: OFFCHAIN_CERTIFICATE_SERVICE_TOKEN,
                    useValue: offchainCertificateServiceMock
                },
                {
                    provide: CERTIFICATE_EVENT_REPOSITORY,
                    useValue: certEventRepoMock
                },
                ClaimPersistHandler
            ]
        }).compile();

        claimPersistHandler = app.get(ClaimPersistHandler);
    });

    const createEvent = (values: Partial<CertificateEventEntity> = {}): CertificateEventEntity => ({
        type: CertificateEventType.Claimed,
        commandId: 0,
        internalCertificateId: 0,
        id: 0,
        createdAt: new Date(),
        payload: {},
        version: 0,
        ...values
    });

    const createCommand = (
        values: Partial<CertificateCommandEntity> = {}
    ): CertificateCommandEntity => ({
        payload: {},
        id: 0,
        createdAt: new Date(),
        ...values
    });

    describe('#canHandle', () => {
        it('should return true for claimed event type', () => {
            let event = createEvent({ type: CertificateEventType.Claimed });

            const canHandle = claimPersistHandler.canHandle(event);

            expect(canHandle).toEqual(true);
        });

        it.each(
            Object.values(CertificateEventType)
                .filter((type) => type !== CertificateEventType.Claimed)
                .map((eventType) => [eventType])
        )('should return false for %s event type', (eventType) => {
            const event = createEvent({ type: eventType });

            const canHandle = claimPersistHandler.canHandle(event);

            expect(canHandle).toEqual(false);
        });
    });

    describe('#handle', () => {
        it('should report persist error if command is null', async () => {
            const command = null;
            const event = createEvent();

            await claimPersistHandler.handle(event, command);

            expect(offchainCertificateServiceMock.persistError).toBeCalledTimes(1);
            expect(offchainCertificateServiceMock.persistError).toBeCalledWith(
                event.internalCertificateId,
                {
                    errorMessage: expect.any(String)
                }
            );
            expect(certificateServiceMock.claim).toBeCalledTimes(0);
            expect(offchainCertificateServiceMock.claimPersisted).toBeCalledTimes(0);
        });

        it('should trigger claim persisted if claim was successful', async () => {
            const command = createCommand();
            const event = createEvent();
            certificateServiceMock.claim.mockResolvedValueOnce({ success: true });

            await claimPersistHandler.handle(event, command);

            expect(offchainCertificateServiceMock.persistError).toBeCalledTimes(0);
            expect(certificateServiceMock.claim).toBeCalledTimes(1);
            expect(certificateServiceMock.claim).toBeCalledWith(command.payload);
            expect(offchainCertificateServiceMock.claimPersisted).toBeCalledTimes(1);
            expect(offchainCertificateServiceMock.claimPersisted).toBeCalledWith(
                event.internalCertificateId,
                {}
            );
        });

        it('should report persist error if synchronization failed', async () => {
            const command = createCommand();
            const event = createEvent();
            certificateServiceMock.claim.mockResolvedValueOnce({ success: false });

            await claimPersistHandler.handle(event, command);

            expect(certificateServiceMock.claim).toBeCalledTimes(1);
            expect(certificateServiceMock.claim).toBeCalledWith(command.payload);
            expect(offchainCertificateServiceMock.claimPersisted).toBeCalledTimes(0);
            expect(offchainCertificateServiceMock.persistError).toBeCalledTimes(1);
            expect(
                offchainCertificateServiceMock.persistError
            ).toBeCalledWith(event.internalCertificateId, { errorMessage: expect.any(String) });
        });
    });

    describe('#handleBatch', () => {
        it('should trigger claim persisted for all events if batchClaim was successful', async () => {
            const command = createCommand();
            const event = createEvent();
            certificateServiceMock.batchClaim.mockResolvedValueOnce({ success: true });

            await claimPersistHandler.handleBatch([event, event], [command, command]);

            expect(offchainCertificateServiceMock.persistError).toBeCalledTimes(0);
            expect(certificateServiceMock.batchClaim).toBeCalledTimes(1);
            expect(certificateServiceMock.batchClaim).toBeCalledWith([
                command.payload,
                command.payload
            ]);
            expect(offchainCertificateServiceMock.claimPersisted).toBeCalledTimes(2);
            expect(offchainCertificateServiceMock.claimPersisted).nthCalledWith(
                1,
                event.internalCertificateId,
                {}
            );
            expect(offchainCertificateServiceMock.claimPersisted).nthCalledWith(
                2,
                event.internalCertificateId,
                {}
            );
        });

        it('should report persist error for all events if synchronization failed', async () => {
            const command = createCommand();
            const event = createEvent();
            certificateServiceMock.batchClaim.mockResolvedValueOnce({ success: false });

            await claimPersistHandler.handleBatch([event, event], [command, command]);

            expect(offchainCertificateServiceMock.claimPersisted).toBeCalledTimes(0);
            expect(certificateServiceMock.batchClaim).toBeCalledTimes(1);
            expect(certificateServiceMock.batchClaim).toBeCalledWith([
                command.payload,
                command.payload
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
