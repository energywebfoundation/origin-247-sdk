import { Test } from '@nestjs/testing';
import { QueryHandler, QueryBus, EventBus, CommandBus } from '@nestjs/cqrs';
import {
    EnergyTransferRequestRepository,
    ENERGY_TRANSFER_REQUEST_REPOSITORY,
    GenerationReadingStoredEvent,
    GetTransferSitesQuery,
    IGetTransferSitesQueryHandler,
    TransferModuleForUnitTest
} from '../src';
import { ValidateTransferCommandCtor } from '../src/commands';

export const waitForStart = () => new Promise((resolve) => setTimeout(resolve, 500));
export const waitForPersistance = () => new Promise((resolve) => setTimeout(resolve, 3000));
export const waitForValidation = () => new Promise((resolve) => setTimeout(resolve, 2000));

export const publishStart = async (eventBus: EventBus) => {
    eventBus.publish(
        new GenerationReadingStoredEvent({
            energyValue: '60',
            fromTime: new Date(),
            generatorId: 'a1',
            metadata: null,
            ownerBlockchainAddress: 'c1',
            toTime: new Date()
        })
    );

    await waitForStart();
};

export const setup = async (options: {
    sites: { buyerId: string; sellerId: string };
    commands: ValidateTransferCommandCtor[];
    providers?: any[];
}) => {
    const getSitesQuery = jest.fn(() => options.sites);

    @QueryHandler(GetTransferSitesQuery)
    class SitesQueryHandler implements IGetTransferSitesQueryHandler {
        async execute(query: GetTransferSitesQuery) {
            return getSitesQuery();
        }
    }

    const moduleFixture = await Test.createTestingModule({
        imports: [TransferModuleForUnitTest.register({ validateCommands: options.commands })],
        providers: [SitesQueryHandler, ...(options.providers ?? [])]
    }).compile();

    const app = moduleFixture.createNestApplication();
    const queryBus = await app.resolve<QueryBus>(QueryBus);
    const commandBus = await app.resolve<CommandBus>(CommandBus);
    const eventBus = await app.resolve<EventBus>(EventBus);
    const repository = await app.resolve<EnergyTransferRequestRepository>(
        ENERGY_TRANSFER_REQUEST_REPOSITORY
    );

    return {
        app,
        queryBus,
        commandBus,
        eventBus,
        repository
    };
};
