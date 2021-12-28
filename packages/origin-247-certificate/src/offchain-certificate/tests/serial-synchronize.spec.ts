import { CertificateEventType } from '../events/Certificate.events';
import { Test } from '@nestjs/testing';
import { SynchronizableEvent } from '../repositories/CertificateEvent/CertificateEvent.repository';
import { SerialSynchronizeStrategy } from '../synchronize/strategies/serial-synchronize.strategy';
import { SYNCHRONIZE_STRATEGY } from '../synchronize/strategies/synchronize.strategy';
import { PersistProcessor } from '../synchronize/handlers/persist.handler';

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
                payload: {}
            } as SynchronizableEvent;
            const events = [eventStub];

            await serialStrategy.synchronize(events);

            expect(persistProcessorMock.handle).toBeCalledTimes(1);
            expect(persistProcessorMock.handle).toBeCalledWith(eventStub);
        });

        it('work for new claim event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Claimed,
                commandId: 1,
                payload: {}
            } as SynchronizableEvent;
            const events = [eventStub];

            await serialStrategy.synchronize(events);

            expect(persistProcessorMock.handle).toBeCalledTimes(1);
            expect(persistProcessorMock.handle).toBeCalledWith(eventStub);
        });

        it('work for new transfer event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Transferred,
                commandId: 1,
                payload: {}
            } as SynchronizableEvent;
            const events = [eventStub];

            await serialStrategy.synchronize(events);

            expect(persistProcessorMock.handle).toBeCalledTimes(1);
            expect(persistProcessorMock.handle).toBeCalledWith(eventStub);
        });
    });
});
