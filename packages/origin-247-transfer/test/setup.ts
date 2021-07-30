import { Test } from '@nestjs/testing';
import { QueryHandler, QueryBus, EventBus, CommandBus } from '@nestjs/cqrs';
import {
    EnergyTransferRequestRepository,
    ENERGY_TRANSFER_REQUEST_REPOSITORY,
    GenerationReadingStoredEvent,
    GetTransferSitesQuery,
    IGetTransferSitesQueryHandler,
    TransferModuleForUnitTest,
    ValidateTransferCommandCtor
} from '../src';

export const publishStart = (eventBus: EventBus) => {
    eventBus.publish(
        new GenerationReadingStoredEvent({
            energyValue: '60',
            fromTime: new Date(),
            generatorId: 'a1',
            metadata: null,
            toTime: new Date(),
            transferDate: new Date()
        })
    );
};

export const setup = async (options: {
    sites: { buyerAddress: string; sellerAddress: string } | null;
    commands: ValidateTransferCommandCtor[];
    providers?: any[];
}) => {
    const getSitesQuery = jest.fn((_) => options.sites);

    @QueryHandler(GetTransferSitesQuery)
    class SitesQueryHandler implements IGetTransferSitesQueryHandler {
        async execute(query: GetTransferSitesQuery) {
            return getSitesQuery(query);
        }
    }

    const moduleFixture = await Test.createTestingModule({
        imports: [
            TransferModuleForUnitTest.register({
                validateCommands: options.commands,
                batchConfiguration: {
                    issueAggregateSeconds: 1,
                    validateAggregateSeconds: 1,
                    transferAggregateSeconds: 1
                }
            })
        ],
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
        repository,
        getEtr: async () => (await repository.findById(1))!
    };
};
