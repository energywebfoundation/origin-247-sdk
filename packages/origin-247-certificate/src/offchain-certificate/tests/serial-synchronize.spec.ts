import { CertificateEventType } from '../events/Certificate.events';
import { Test } from '@nestjs/testing';
import { CERTIFICATE_COMMAND_REPOSITORY } from '../repositories/CertificateCommand/CertificateCommand.repository';
import {
    CERTIFICATE_EVENT_REPOSITORY,
    ProcessableEvent
} from '../repositories/CertificateEvent/CertificateEvent.repository';
import { blockchainQueueName } from '../../blockchain-actions.processor';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { CertificateCommandEntity } from '../repositories/CertificateCommand/CertificateCommand.entity';
import { SerialSynchronizeStrategy } from '../synchronize/strategies/serial-synchronize.strategy';
import { SYNCHRONIZE_STRATEGY } from '../synchronize/strategies/synchronize.strategy';

describe('BlockchainSynchronize', () => {
    let serialStrategy: SerialSynchronizeStrategy;
    const addToQueueMock = jest.fn();
    const eventRepositoryMock = {
        getAllNotProcessed: jest.fn(),
        markAsSynchronized: jest.fn(),
        getAll: jest.fn(),
        saveProcessingError: jest.fn(),
        save: jest.fn(),
        getByInternalCertificateId: jest.fn(),
        getNumberOfCertificates: jest.fn()
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
                    provide: getQueueToken(blockchainQueueName),
                    useValue: {
                        add: addToQueueMock
                    } as Partial<Queue>
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
        });

        it('work for new issuance event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {}
            } as ProcessableEvent;
            const commandStub = {
                payload: {},
                id: 1
            } as CertificateCommandEntity;
            const events = [eventStub];
            commandRepositoryMock.getById.mockResolvedValueOnce(commandStub);

            await serialStrategy.synchronize(events);

            expect(commandRepositoryMock.getById).toBeCalledTimes(1);
            expect(commandRepositoryMock.getById).toBeCalledWith(eventStub.commandId);
            expect(eventRepositoryMock.markAsSynchronized).toBeCalledWith(eventStub.id);
        });

        it('work for new claim event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Claimed,
                commandId: 1,
                payload: {}
            } as ProcessableEvent;
            const commandStub = {
                payload: {},
                id: 1
            } as CertificateCommandEntity;
            const events = [eventStub];
            commandRepositoryMock.getById.mockResolvedValueOnce(commandStub);

            await serialStrategy.synchronize(events);

            expect(commandRepositoryMock.getById).toBeCalledTimes(1);
            expect(commandRepositoryMock.getById).toBeCalledWith(eventStub.commandId);
            expect(eventRepositoryMock.markAsSynchronized).toBeCalledWith(eventStub.id);
        });

        it('work for new transfer event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Transferred,
                commandId: 1,
                payload: {}
            } as ProcessableEvent;
            const commandStub = {
                payload: {},
                id: 1
            } as CertificateCommandEntity;
            const events = [eventStub];
            commandRepositoryMock.getById.mockResolvedValueOnce(commandStub);

            await serialStrategy.synchronize(events);

            expect(commandRepositoryMock.getById).toBeCalledTimes(1);
            expect(commandRepositoryMock.getById).toBeCalledWith(eventStub.commandId);
            expect(eventRepositoryMock.markAsSynchronized).toBeCalledWith(eventStub.id);
        });
    });
});
