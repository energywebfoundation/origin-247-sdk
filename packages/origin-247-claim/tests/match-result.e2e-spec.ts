import { bootstrapTestInstance } from './setup-e2e';
import { INestApplication, Logger } from '@nestjs/common';
import {
    MatchResultRepository,
    Entity
} from '../src/repositories/MatchResult/MatchResult.repository';
import { DatabaseService } from '@energyweb/origin-backend-utils';

jest.setTimeout(60 * 1000);

describe('MatchResult - e2e', () => {
    let app: INestApplication;
    let matchResultRepository: MatchResultRepository;
    let databaseService: DatabaseService;

    beforeAll(async () => {
        ({ app, matchResultRepository, databaseService } = await bootstrapTestInstance());

        await app.init();
    });

    beforeEach(async () => {
        await databaseService.cleanUp();
        await seed();
    });

    describe('matchResultRepository', () => {
        it('should create a match result', async () => {
            await matchResultRepository.create({
                consumerId: 'consumerOne',
                generatorId: 'generatorOne',
                consumerMetadata: {},
                generatorMetadata: {},
                volume: '100000',
                from: new Date(),
                to: new Date()
            });

            const found = await matchResultRepository.getAll();
            expect(found).toHaveLength(matchResults.length + 1);
        });

        it('should find all matches results', async () => {
            const found = await matchResultRepository.getAll();
            expect(found).toHaveLength(matchResults.length);
        });

        it('should find matches results that satisfy findOptions', async () => {
            const res = await matchResultRepository.find({
                consumerIds: ['consumerOne', 'consumerTwo'],
                generatorIds: ['generatorOne'],
                from: new Date('2021-08-01T10:00:00.000Z'),
                to: new Date('2021-08-01T12:00:00.000Z')
            });
            expect(res).toHaveLength(4);
        });

        it('should find matches results that satisfy findOptions', async () => {
            const res = await matchResultRepository.findGrouped(
                {
                    consumerIds: ['consumerOne', 'consumerTwo'],
                    generatorIds: ['generatorOne'],
                    from: new Date('2021-08-01T11:00:00.000Z'),
                    to: new Date('2021-08-01T12:00:00.000Z')
                },
                [Entity.Consumer, Entity.Generator]
            );

            expect(res).toHaveLength(1);
            expect(res[0].entries).toHaveLength(2);
        });

        it('findGrouped() should group by single column', async () => {
            const res = await matchResultRepository.findGrouped(
                {
                    consumerIds: ['consumerOne', 'consumerTwo'],
                    generatorIds: ['generatorOne', 'generatorTwo'],
                    from: new Date('2021-08-01T10:00:00.000Z'),
                    to: new Date('2021-08-01T12:00:00.000Z')
                },
                [Entity.Consumer]
            );
            expect(res).toHaveLength(2);
            expect(res[0].entries).toHaveLength(2);
            expect(res[1].entries).toHaveLength(3);
        });

        it('findGrouped() should group by single column - different order', async () => {
            const res = await matchResultRepository.findGrouped(
                {
                    consumerIds: ['consumerOne', 'consumerTwo'],
                    generatorIds: ['generatorOne', 'generatorTwo', 'generatorThree'],
                    from: new Date('2021-08-01T10:00:00.000Z'),
                    to: new Date('2021-08-01T12:00:00.000Z')
                },
                [Entity.Generator]
            );
            console.log(JSON.stringify(res, null, 2));

            expect(res).toHaveLength(3);
            expect(res[0].entries).toHaveLength(1);
            expect(res[1].entries).toHaveLength(4);
            expect(res[2].entries).toHaveLength(1);
        });

        it('findGrouped() should group by two columns', async () => {
            const res = await matchResultRepository.findGrouped(
                {
                    consumerIds: ['consumerOne', 'consumerTwo'],
                    generatorIds: ['generatorOne', 'generatorTwo', 'generatorThree'],
                    from: new Date('2021-08-01T10:00:00.000Z'),
                    to: new Date('2021-08-01T12:00:00.000Z')
                },
                [Entity.Consumer, Entity.Generator]
            );
            expect(res).toHaveLength(4);
            expect(res[0].entries).toHaveLength(1);
            expect(res[1].entries).toHaveLength(1);
            expect(res[2].entries).toHaveLength(3);
            expect(res[3].entries).toHaveLength(1);
        });

        it('findGrouped() should group by two columns - different order', async () => {
            const res = await matchResultRepository.findGrouped(
                {
                    consumerIds: ['consumerOne', 'consumerTwo'],
                    generatorIds: ['generatorOne', 'generatorTwo', 'generatorThree'],
                    from: new Date('2021-08-01T10:00:00.000Z'),
                    to: new Date('2021-08-01T12:00:00.000Z')
                },
                [Entity.Generator, Entity.Consumer]
            );
            expect(res).toHaveLength(4);
            expect(res[0].entries).toHaveLength(1);
            expect(res[1].entries).toHaveLength(1);
            expect(res[2].entries).toHaveLength(3);
            expect(res[3].entries).toHaveLength(1);
        });
    });

    async function seed() {
        await Promise.all([
            matchResultRepository.create(matchResults[0]),
            matchResultRepository.create(matchResults[1]),
            matchResultRepository.create(matchResults[2]),
            matchResultRepository.create(matchResults[3]),
            matchResultRepository.create(matchResults[4]),
            matchResultRepository.create(matchResults[5])
        ]);
    }
});

const matchResults = [
    {
        consumerId: 'consumerOne',
        generatorId: 'generatorOne',
        consumerMetadata: {},
        generatorMetadata: {},
        volume: '100000',
        from: new Date('2021-08-01T10:45:00.000Z'),
        to: new Date('2021-08-01T11:00:00.000Z')
    },
    {
        consumerId: 'consumerOne',
        generatorId: 'generatorTwo',
        consumerMetadata: {},
        generatorMetadata: {},
        volume: '100000',
        from: new Date('2021-08-01T10:45:00.000Z'),
        to: new Date('2021-08-01T11:00:00.000Z')
    },
    {
        consumerId: 'consumerOne',
        generatorId: 'generatorThree',
        consumerMetadata: {},
        generatorMetadata: {},
        volume: '100000',
        from: new Date('2021-08-01T10:45:00.000Z'),
        to: new Date('2021-08-01T11:00:00.000Z')
    },
    {
        consumerId: 'consumerTwo',
        generatorId: 'generatorOne',
        consumerMetadata: {},
        generatorMetadata: {},
        volume: '100000',
        from: new Date('2021-08-01T10:45:00.000Z'),
        to: new Date('2021-08-01T11:00:00.000Z')
    },
    {
        consumerId: 'consumerTwo',
        generatorId: 'generatorOne',
        consumerMetadata: {},
        generatorMetadata: {},
        volume: '100000',
        from: new Date('2021-08-01T11:00:00.000Z'),
        to: new Date('2021-08-01T11:15:00.000Z')
    },
    {
        consumerId: 'consumerTwo',
        generatorId: 'generatorOne',
        consumerMetadata: {},
        generatorMetadata: {},
        volume: '100000',
        from: new Date('2021-08-01T11:15:00.000Z'),
        to: new Date('2021-08-01T11:30:00.000Z')
    }
];
