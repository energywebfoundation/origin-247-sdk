import { Test } from '@nestjs/testing';
import { QueryHandler, QueryBus, EventBus } from '@nestjs/cqrs';
import {
    GenerationReadingStoredEvent,
    GetTransferSitesQuery,
    IGetTransferSitesQueryHandler,
    TransferModuleForUnitTest
} from '../src';

describe('Transfer module', () => {
    it('should build', async () => {
        const getSitesQuery = jest.fn(() => ({ buyerId: 'buyer', sellerId: 'seller' }));

        @QueryHandler(GetTransferSitesQuery)
        class SitesQueryHandler implements IGetTransferSitesQueryHandler {
            async execute(query: GetTransferSitesQuery) {
                return getSitesQuery();
            }
        }

        const moduleFixture = await Test.createTestingModule({
            imports: [TransferModuleForUnitTest.register()],
            providers: [SitesQueryHandler]
        }).compile();

        const app = moduleFixture.createNestApplication();
        const queryBus = await app.resolve<QueryBus>(QueryBus);
        const eventBus = await app.resolve<EventBus>(EventBus);

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
    });
});
