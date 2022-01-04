import { CertificateEventType } from '../events/Certificate.events';
import { Test } from '@nestjs/testing';
import { SynchronizableEvent } from '../repositories/CertificateEvent/CertificateEvent.repository';
import { SYNCHRONIZE_STRATEGY } from '../synchronize/strategies/synchronize.strategy';
import { BatchSynchronizeStrategy } from '../synchronize/strategies/batch/batch-synchronize.strategy';
import { SynchronizeManager } from '../synchronize/handlers/synchronize.manager';

describe('BatchSynchronizeStrategy', () => {
    let batchSynchronizeStrategy: BatchSynchronizeStrategy;
    const synchronizeManagerMock = {
        handleBatch: jest.fn()
    };

    const noFailedCertificateIds = {
        failedCertificateIds: []
    };

    beforeEach(async () => {
        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: SYNCHRONIZE_STRATEGY,
                    useClass: BatchSynchronizeStrategy
                },
                {
                    provide: SynchronizeManager,
                    useValue: synchronizeManagerMock
                }
            ]
        }).compile();

        batchSynchronizeStrategy = app.get(SYNCHRONIZE_STRATEGY);
    });

    describe('synchronize', () => {
        it('should work for no events', async () => {
            const events = [];

            await batchSynchronizeStrategy.synchronize(events);

            expect(synchronizeManagerMock.handleBatch).toBeCalledTimes(0);
        });

        it('work for new issuance event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {}
            } as SynchronizableEvent;
            synchronizeManagerMock.handleBatch.mockResolvedValueOnce({ failedCertificateIds: [] });

            const events = [eventStub];

            await batchSynchronizeStrategy.synchronize(events);

            expect(synchronizeManagerMock.handleBatch).toBeCalledTimes(1);
            expect(synchronizeManagerMock.handleBatch).toBeCalledWith(events);
        });

        it('work for new claim event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Claimed,
                commandId: 1,
                payload: {}
            } as SynchronizableEvent;
            const events = [eventStub];
            synchronizeManagerMock.handleBatch.mockResolvedValueOnce({ failedCertificateIds: [] });

            await batchSynchronizeStrategy.synchronize(events);

            expect(synchronizeManagerMock.handleBatch).toBeCalledTimes(1);
            expect(synchronizeManagerMock.handleBatch).toBeCalledWith(events);
        });

        it('work for new transfer event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Transferred,
                commandId: 1,
                payload: {}
            } as SynchronizableEvent;
            const events = [eventStub];
            synchronizeManagerMock.handleBatch.mockResolvedValueOnce({ failedCertificateIds: [] });

            await batchSynchronizeStrategy.synchronize(events);

            expect(synchronizeManagerMock.handleBatch).toBeCalledTimes(1);
            expect(synchronizeManagerMock.handleBatch).toBeCalledWith(events);
        });

        it('should not be processed further if previous step failed for that certificate', async () => {
            const claimedEvent = {
                internalCertificateId: 0,
                id: 0,
                type: CertificateEventType.Claimed,
                commandId: 1,
                payload: {},
                createdAt: new Date()
            } as SynchronizableEvent;
            const transferredEvent = {
                internalCertificateId: 0,
                id: 0,
                type: CertificateEventType.Transferred,
                commandId: 1,
                payload: {},
                createdAt: new Date()
            } as SynchronizableEvent;
            const events = [claimedEvent, transferredEvent];
            synchronizeManagerMock.handleBatch.mockResolvedValueOnce({
                failedCertificateIds: [claimedEvent.internalCertificateId]
            });

            await batchSynchronizeStrategy.synchronize(events);

            expect(synchronizeManagerMock.handleBatch).toBeCalledTimes(1);
            expect(synchronizeManagerMock.handleBatch).toBeCalledWith([claimedEvent]);
        });

        it('should be processed further if previous step succeeded  for that certificate', async () => {
            const claimedEvent = {
                id: 0,
                type: CertificateEventType.Claimed,
                commandId: 1,
                payload: {},
                createdAt: new Date()
            } as SynchronizableEvent;
            const transferredEvent = {
                id: 0,
                type: CertificateEventType.Transferred,
                commandId: 1,
                payload: {},
                createdAt: new Date()
            } as SynchronizableEvent;
            const events = [claimedEvent, transferredEvent];
            synchronizeManagerMock.handleBatch
                .mockResolvedValueOnce(noFailedCertificateIds)
                .mockResolvedValueOnce(noFailedCertificateIds);

            await batchSynchronizeStrategy.synchronize(events);

            expect(synchronizeManagerMock.handleBatch).toBeCalledTimes(2);
            expect(synchronizeManagerMock.handleBatch).toHaveBeenNthCalledWith(1, [claimedEvent]);
            expect(synchronizeManagerMock.handleBatch).toHaveBeenNthCalledWith(2, [
                transferredEvent
            ]);
        });
    });
});
