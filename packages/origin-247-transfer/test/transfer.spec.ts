import { Test } from '@nestjs/testing';
import { QueryHandler, QueryBus, EventBus, CommandBus } from '@nestjs/cqrs';
import {
    GenerationReadingStoredEvent,
    GetTransferSitesQuery,
    IGetTransferSitesQueryHandler,
    TransferModuleForUnitTest
} from '../src';

describe('Transfer module', () => {
    it('should build', async () => {
        const { app, queryBus, commandBus, eventBus } = await setup({
            sites: { buyerId: 'buyer1', sellerId: 'seller1' }
        });

        await app.init();

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

        await new Promise((resolve) => setTimeout(resolve, 3000));

        expect(getSitesQuery).toBeCalledTimes(1);

        await app.close();
    });
});

const setup = async (options: { sites: { buyerId: string; sellerId: string } }) => {
    const getSitesQuery = jest.fn(() => options.sites);

    @QueryHandler(GetTransferSitesQuery)
    class SitesQueryHandler implements IGetTransferSitesQueryHandler {
        async execute(query: GetTransferSitesQuery) {
            return getSitesQuery();
        }
    }

    const moduleFixture = await Test.createTestingModule({
        imports: [TransferModuleForUnitTest.register({ validateCommands: [] })],
        providers: [SitesQueryHandler]
    }).compile();

    const app = moduleFixture.createNestApplication();
    const queryBus = await app.resolve<QueryBus>(QueryBus);
    const commandBus = await app.resolve<CommandBus>(CommandBus);
    const eventBus = await app.resolve<EventBus>(EventBus);

    return {
        app,
        queryBus,
        commandBus,
        eventBus
    };
};
