import { Test } from '@nestjs/testing';
import { CERTIFICATE_EVENT_REPOSITORY } from '../repositories/repository.keys';
import { IIssueCommand } from '../../types';
import { CertificateEventType, CertificateIssuedEvent } from '../events/Certificate.events';
import { CertificateEventEntity } from '../repositories/CertificateEvent/CertificateEvent.entity';
import { IssuePersistHandler } from '../synchronize/handlers/issue-persist.handler';
import {
    BATCH_CONFIGURATION_TOKEN,
    batchConfiguration
} from '../synchronize/strategies/batch/batch.configuration';
import { ONCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../..';
import { OFFCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../types';

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
                    provide: ONCHAIN_CERTIFICATE_SERVICE_TOKEN,
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
                {
                    provide: BATCH_CONFIGURATION_TOKEN,
                    useValue: batchConfiguration
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
        payload: {
            fromTime: new Date().getTime(),
            toTime: new Date().getTime()
        } as IIssueCommand<any>,
        version: 0,
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
        it('should trigger issue persisted if issue was successful', async () => {
            const event = createEvent() as CertificateIssuedEvent;
            const blockchainCertificateId = 0;
            certificateServiceMock.issue.mockResolvedValueOnce({ id: blockchainCertificateId });

            await issuePersistHandler.handle(event as CertificateEventEntity);

            expect(offchainCertificateServiceMock.persistError).toBeCalledTimes(0);
            expect(certificateServiceMock.issue).toBeCalledTimes(1);
            expect(certificateServiceMock.issue).toBeCalledWith({
                ...event.payload,
                fromTime: new Date(event.payload.fromTime),
                toTime: new Date(event.payload.toTime)
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
            const event = createEvent();
            const eventPayload = event.payload as IIssueCommand<any>;
            certificateServiceMock.issue.mockResolvedValueOnce(undefined);

            await issuePersistHandler.handle(event);

            expect(certificateServiceMock.issue).toBeCalledTimes(1);
            expect(certificateServiceMock.issue).toBeCalledWith({
                ...eventPayload,
                fromTime: new Date(eventPayload.fromTime),
                toTime: new Date(eventPayload.toTime)
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
            const event = createEvent();
            const eventPayload = event.payload as IIssueCommand<any>;
            const expectedEventPayloadCall = {
                ...eventPayload,
                fromTime: new Date(eventPayload.fromTime),
                toTime: new Date(eventPayload.toTime)
            };
            const resolvedCertificateIds = [0, 1];
            certificateServiceMock.batchIssue.mockResolvedValueOnce(resolvedCertificateIds);

            await issuePersistHandler.handleBatch([event, event]);

            expect(offchainCertificateServiceMock.persistError).toBeCalledTimes(0);
            expect(certificateServiceMock.batchIssue).toBeCalledTimes(1);
            expect(certificateServiceMock.batchIssue).toBeCalledWith([
                expectedEventPayloadCall,
                expectedEventPayloadCall
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
            const event = createEvent();
            certificateServiceMock.batchIssue.mockResolvedValueOnce(undefined);
            const eventPayload = event.payload as IIssueCommand<any>;
            const expectedEventPayloadCall = {
                ...eventPayload,
                fromTime: new Date(eventPayload.fromTime),
                toTime: new Date(eventPayload.toTime)
            };

            await issuePersistHandler.handleBatch([event, event]);

            expect(offchainCertificateServiceMock.issuePersisted).toBeCalledTimes(0);
            expect(certificateServiceMock.batchIssue).toBeCalledTimes(1);
            expect(certificateServiceMock.batchIssue).toBeCalledWith([
                expectedEventPayloadCall,
                expectedEventPayloadCall
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
