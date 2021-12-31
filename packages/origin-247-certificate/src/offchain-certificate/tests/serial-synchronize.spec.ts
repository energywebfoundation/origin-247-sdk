import { CertificateEventType } from '../events/Certificate.events';
import { Test } from '@nestjs/testing';
import { SynchronizableEvent } from '../repositories/CertificateEvent/CertificateEvent.repository';
import { SYNCHRONIZE_STRATEGY } from '../synchronize/strategies/synchronize.strategy';
import { PersistProcessor } from '../synchronize/handlers/persist.handler';
import { SerialSynchronizeStrategy } from '../synchronize/strategies/serial/serial-synchronize.strategy';

describe('BlockchainSynchronize', () => {
    let serialStrategy: SerialSynchronizeStrategy;
    const persistProcessorMock = {
        handle: jest.fn()
    };

    beforeEach(async () => {
        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: SYNCHRONIZE_STRATEGY,
                    useClass: SerialSynchronizeStrategy
                },
                {
                    provide: PersistProcessor,
                    useValue: persistProcessorMock
                }
            ]
        }).compile();

        serialStrategy = app.get(SYNCHRONIZE_STRATEGY);
    });

    describe('synchronize', () => {
        it('should work for no events', async () => {
            const events = [];

            await serialStrategy.synchronize(events);

            expect(persistProcessorMock.handle).toBeCalledTimes(0);
        });

        it('work for new issuance event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                createdAt: new Date(),
                payload: {}
            } as SynchronizableEvent;
            const events = [eventStub];
            persistProcessorMock.handle.mockResolvedValueOnce({ success: true });

            await serialStrategy.synchronize(events);

            expect(persistProcessorMock.handle).toBeCalledTimes(1);
            expect(persistProcessorMock.handle).toBeCalledWith(eventStub);
        });

        it('work for new claim event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Claimed,
                commandId: 1,
                createdAt: new Date(),
                payload: {}
            } as SynchronizableEvent;
            const events = [eventStub];
            persistProcessorMock.handle.mockResolvedValueOnce({ success: true });

            await serialStrategy.synchronize(events);

            expect(persistProcessorMock.handle).toBeCalledTimes(1);
            expect(persistProcessorMock.handle).toBeCalledWith(eventStub);
        });

        it('work for new transfer event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Transferred,
                commandId: 1,
                createdAt: new Date(),
                payload: {}
            } as SynchronizableEvent;
            persistProcessorMock.handle.mockResolvedValueOnce({ success: true });
            const events = [eventStub];

            await serialStrategy.synchronize(events);

            expect(persistProcessorMock.handle).toBeCalledTimes(1);
            expect(persistProcessorMock.handle).toBeCalledWith(eventStub);
        });

        it('should not synchronize event if it failed for that certificate ids', async () => {
            const issueEvent = {
                id: 0,
                internalCertificateId: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                createdAt: new Date(0),
                payload: {}
            } as SynchronizableEvent;
            const claimEvent = {
                id: 0,
                internalCertificateId: 0,
                type: CertificateEventType.Claimed,
                commandId: 1,
                createdAt: new Date(1),
                payload: {}
            } as SynchronizableEvent;
            const events = [issueEvent, claimEvent];
            persistProcessorMock.handle.mockResolvedValueOnce({ success: false });

            await serialStrategy.synchronize(events);

            expect(persistProcessorMock.handle).toBeCalledTimes(1);
            expect(persistProcessorMock.handle).toBeCalledWith(issueEvent);
        });
    });
});
