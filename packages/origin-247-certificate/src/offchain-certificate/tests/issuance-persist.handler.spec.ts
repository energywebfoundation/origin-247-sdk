import { Test } from '@nestjs/testing';
import { CERTIFICATE_EVENT_REPOSITORY } from '../repositories/repository.keys';
import {
    CERTIFICATE_SERVICE_TOKEN,
    IIssueCommand,
    OFFCHAIN_CERTIFICATE_SERVICE_TOKEN
} from '../../types';
import { CertificateEventType } from '../events/Certificate.events';
import { CertificateEventEntity } from '../repositories/CertificateEvent/CertificateEvent.entity';
import { CertificateCommandEntity } from '../repositories/CertificateCommand/CertificateCommand.entity';
import { IssuePersistHandler } from '../synchronize/handlers/issue-persist-handler.service';

describe('IssuePersistHandler', () => {
    let issuePersistHandler: IssuePersistHandler;
    const certEventRepoMock = {};

    const offchainCertificateServiceMock = {
        persistError: jest.fn(),
        issuePersisted: jest.fn()
    };

    const certificateServiceMock = {
        issue: jest.fn(),
        batchIssue: jest.fn()
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
                IssuePersistHandler
            ]
        }).compile();

        issuePersistHandler = app.get(IssuePersistHandler);
    });

    const createEvent = (values: Partial<CertificateEventEntity> = {}): CertificateEventEntity => ({
        type: CertificateEventType.Issued,
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
        payload: {
            fromTime: 0,
            deviceId: '0',
            toTime: 0,
            energyValue: '0',
            metadata: {},
            toAddress: '0',
            userId: '0'
        },
        id: 0,
        createdAt: new Date(),
        ...values
    });

    describe('#canHandle', () => {
        it('should return true for issued event type', () => {
            let event = createEvent({ type: CertificateEventType.Issued });

            const canHandle = issuePersistHandler.canHandle(event);

            expect(canHandle).toEqual(true);
        });

        it.each(
            Object.values(CertificateEventType)
                .filter((type) => type !== CertificateEventType.Issued)
                .map((eventType) => [eventType])
        )('should return false for %s event type', (eventType) => {
            const event = createEvent({ type: eventType });

            const canHandle = issuePersistHandler.canHandle(event);

            expect(canHandle).toEqual(false);
        });
    });

    describe('#handle', () => {
        it('should report persist error if command is null', async () => {
            const command = null;
            const event = createEvent();

            await issuePersistHandler.handle(event, command);

            expect(offchainCertificateServiceMock.persistError).toBeCalledTimes(1);
            expect(offchainCertificateServiceMock.persistError).toBeCalledWith(
                event.internalCertificateId,
                {
                    errorMessage: expect.any(String)
                }
            );
            expect(certificateServiceMock.issue).toBeCalledTimes(0);
            expect(offchainCertificateServiceMock.issuePersisted).toBeCalledTimes(0);
        });

        it('should trigger issue persisted if issue was successful', async () => {
            const command = createCommand();
            const commandPayload = command.payload as IIssueCommand<any>;
            const event = createEvent();
            const blockchainCertificateId = 0;
            certificateServiceMock.issue.mockResolvedValueOnce({ id: blockchainCertificateId });

            await issuePersistHandler.handle(event, command);

            expect(offchainCertificateServiceMock.persistError).toBeCalledTimes(0);
            expect(certificateServiceMock.issue).toBeCalledTimes(1);
            expect(certificateServiceMock.issue).toBeCalledWith({
                ...commandPayload,
                fromTime: new Date(commandPayload.fromTime),
                toTime: new Date(commandPayload.toTime)
            });
            expect(offchainCertificateServiceMock.issuePersisted).toBeCalledTimes(1);
            expect(offchainCertificateServiceMock.issuePersisted).toBeCalledWith(
                event.internalCertificateId,
                {
                    blockchainCertificateId
                }
            );
        });

        it('should report persist error if synchronization failed', async () => {
            const command = createCommand();
            const event = createEvent();
            const commandPayload = command.payload as IIssueCommand<any>;
            certificateServiceMock.issue.mockResolvedValueOnce(undefined);

            await issuePersistHandler.handle(event, command);

            expect(certificateServiceMock.issue).toBeCalledTimes(1);
            expect(certificateServiceMock.issue).toBeCalledWith({
                ...commandPayload,
                fromTime: new Date(commandPayload.fromTime),
                toTime: new Date(commandPayload.toTime)
            });
            expect(offchainCertificateServiceMock.issuePersisted).toBeCalledTimes(0);
            expect(offchainCertificateServiceMock.persistError).toBeCalledTimes(1);
            expect(
                offchainCertificateServiceMock.persistError
            ).toBeCalledWith(event.internalCertificateId, { errorMessage: expect.any(String) });
        });
    });

    describe('#handleBatch', () => {
        it('should trigger issue persisted for all events if batchIssue was successful', async () => {
            const command = createCommand();
            const commandPayload = command.payload as IIssueCommand<any>;
            const expectedCommandPayloadCall = {
                ...commandPayload,
                fromTime: new Date(commandPayload.fromTime),
                toTime: new Date(commandPayload.toTime)
            };
            const event = createEvent();
            const resolvedCertificateIds = [0, 1];
            certificateServiceMock.batchIssue.mockResolvedValueOnce(resolvedCertificateIds);

            await issuePersistHandler.handleBatch([event, event], [command, command]);

            expect(offchainCertificateServiceMock.persistError).toBeCalledTimes(0);
            expect(certificateServiceMock.batchIssue).toBeCalledTimes(1);
            expect(certificateServiceMock.batchIssue).toBeCalledWith([
                expectedCommandPayloadCall,
                expectedCommandPayloadCall
            ]);
            expect(offchainCertificateServiceMock.issuePersisted).toBeCalledTimes(2);
            expect(offchainCertificateServiceMock.issuePersisted).nthCalledWith(
                1,
                event.internalCertificateId,
                {
                    blockchainCertificateId: resolvedCertificateIds[0]
                }
            );
            expect(offchainCertificateServiceMock.issuePersisted).nthCalledWith(
                2,
                event.internalCertificateId,
                {
                    blockchainCertificateId: resolvedCertificateIds[1]
                }
            );
        });

        it('should report persist error for all events if synchronization failed', async () => {
            const command = createCommand();
            const event = createEvent();
            certificateServiceMock.batchIssue.mockResolvedValueOnce(undefined);
            const commandPayload = command.payload as IIssueCommand<any>;
            const expectedCommandPayloadCall = {
                ...commandPayload,
                fromTime: new Date(commandPayload.fromTime),
                toTime: new Date(commandPayload.toTime)
            };

            await issuePersistHandler.handleBatch([event, event], [command, command]);

            expect(offchainCertificateServiceMock.issuePersisted).toBeCalledTimes(0);
            expect(certificateServiceMock.batchIssue).toBeCalledTimes(1);
            expect(certificateServiceMock.batchIssue).toBeCalledWith([
                expectedCommandPayloadCall,
                expectedCommandPayloadCall
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
