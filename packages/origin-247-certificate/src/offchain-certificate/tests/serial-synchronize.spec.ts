import { CertificateEventType } from '../events/Certificate.events';
import { Test } from '@nestjs/testing';
import { SynchronizableEvent } from '../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateCommandEntity } from '../repositories/CertificateCommand/CertificateCommand.entity';
import { SerialSynchronizeStrategy } from '../synchronize/strategies/serial-synchronize.strategy';
import { SYNCHRONIZE_STRATEGY } from '../synchronize/strategies/synchronize.strategy';
import {
    CERTIFICATE_COMMAND_REPOSITORY,
    CERTIFICATE_EVENT_REPOSITORY
} from '../repositories/repository.keys';
import { PersistProcessor } from '../synchronize/handlers/persist.handler';

describe('BlockchainSynchronize', () => {
    let serialStrategy: SerialSynchronizeStrategy;
    const eventRepositoryMock = {
        getAllNotProcessed: jest.fn(),
        markAsSynchronized: jest.fn(),
        getAll: jest.fn(),
        saveProcessingError: jest.fn(),
        save: jest.fn(),
        getByInternalCertificateId: jest.fn(),
        getNumberOfCertificates: jest.fn()
    };

    const persistProcessorMock = {
        handle: jest.fn()
    };

    const commandRepositoryMock = {
        getById: jest.fn()
    };

    beforeEach(async () => {
        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: CERTIFICATE_COMMAND_REPOSITORY,
                    useValue: commandRepositoryMock
                },
                {
                    provide: CERTIFICATE_EVENT_REPOSITORY,
                    useValue: eventRepositoryMock
                },
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

            expect(commandRepositoryMock.getById).toBeCalledTimes(0);
            expect(eventRepositoryMock.markAsSynchronized).toBeCalledTimes(0);
            expect(persistProcessorMock.handle).toBeCalledTimes(0);
        });

        it('work for new issuance event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {}
            } as SynchronizableEvent;
            const commandStub = {
                payload: {},
                id: 1
            } as CertificateCommandEntity;
            const events = [eventStub];
            commandRepositoryMock.getById.mockResolvedValueOnce(commandStub);

            await serialStrategy.synchronize(events);

            expect(commandRepositoryMock.getById).toBeCalledTimes(1);
            expect(commandRepositoryMock.getById).toBeCalledWith(eventStub.commandId);
            expect(persistProcessorMock.handle).toBeCalledTimes(1);
            expect(persistProcessorMock.handle).toBeCalledWith(eventStub, commandStub);
        });

        it('work for new claim event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Claimed,
                commandId: 1,
                payload: {}
            } as SynchronizableEvent;
            const commandStub = {
                payload: {},
                id: 1
            } as CertificateCommandEntity;
            const events = [eventStub];
            commandRepositoryMock.getById.mockResolvedValueOnce(commandStub);

            await serialStrategy.synchronize(events);

            expect(commandRepositoryMock.getById).toBeCalledTimes(1);
            expect(commandRepositoryMock.getById).toBeCalledWith(eventStub.commandId);
            expect(persistProcessorMock.handle).toBeCalledTimes(1);
            expect(persistProcessorMock.handle).toBeCalledWith(eventStub, commandStub);
        });

        it('work for new transfer event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Transferred,
                commandId: 1,
                payload: {}
            } as SynchronizableEvent;
            const commandStub = {
                payload: {},
                id: 1
            } as CertificateCommandEntity;
            const events = [eventStub];
            commandRepositoryMock.getById.mockResolvedValueOnce(commandStub);

            await serialStrategy.synchronize(events);

            expect(commandRepositoryMock.getById).toBeCalledTimes(1);
            expect(commandRepositoryMock.getById).toBeCalledWith(eventStub.commandId);
            expect(persistProcessorMock.handle).toBeCalledTimes(1);
            expect(persistProcessorMock.handle).toBeCalledWith(eventStub, commandStub);
        });
    });
});
