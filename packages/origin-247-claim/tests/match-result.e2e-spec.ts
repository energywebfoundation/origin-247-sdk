import { bootstrapTestInstance } from './setu-e2e';
import { INestApplication, Logger } from '@nestjs/common';
import { MatchResultRepository, Entity } from '../src/repositories/MatchResult.repository';
import { DatabaseService } from '@energyweb/origin-backend-utils';

jest.setTimeout(60 * 1000);

describe('MatchResult - e2e', () => {
    let app: INestApplication;
    let repository: MatchResultRepository;
    let databaseService: DatabaseService;

    beforeAll(async () => {
        ({ app, repository, databaseService } = await bootstrapTestInstance());

        await app.init();
    });

    beforeEach(async () => {
        await databaseService.cleanUp();
        await seed();
    });

    describe('matchResultRepository', () => {
        it('should create a match result', async () => {
            await repository.create({
                firstEntityId: 'consumerOne',
                secondEntityId: 'generatorOne',
                firstEntityMetaData: {},
                secondEntityMetaData: {},
                volume: '100000',
                from: new Date(),
                to: new Date()
            });

            const found = await repository.getAll();
            expect(found).toHaveLength(matchResults.length + 1);
        });

        it('should find all matches results', async () => {
            const found = await repository.getAll();
            expect(found).toHaveLength(matchResults.length);
        });

        it('should find matches results that satisfy findOptions', async () => {
            const res = await repository.find({
                firstEntityId: ['consumerOne', 'consumerTwo'],
                secondEntityId: ['generatorOne'],
                from: new Date('2021-08-01T10:00:00.000Z'),
                to: new Date('2021-08-01T12:00:00.000Z')
            });
            expect(res).toHaveLength(4);
        });

        it('should find matches results that satisfy findOptions', async () => {
            const res = await repository.findGrouped(
                {
                    firstEntityId: ['consumerOne', 'consumerTwo'],
                    secondEntityId: ['generatorOne'],
                    from: new Date('2021-08-01T10:00:00.000Z'),
                    to: new Date('2021-08-01T12:00:00.000Z')
                },
                [Entity.FirstEntity, Entity.SecondEntity]
            );
        });
    });

    async function seed() {
        await Promise.all([
            repository.create(matchResults[0]),
            repository.create(matchResults[1]),
            repository.create(matchResults[2]),
            repository.create(matchResults[3]),
            repository.create(matchResults[4]),
            repository.create(matchResults[5])
        ]);
    }
});

const matchResults = [
    {
        firstEntityId: 'consumerOne',
        secondEntityId: 'generatorOne',
        firstEntityMetaData: {},
        secondEntityMetaData: {},
        volume: '100000',
        from: new Date('2021-08-01T10:45:00.000Z'),
        to: new Date('2021-08-01T11:00:00.000Z')
    },
    {
        firstEntityId: 'consumerOne',
        secondEntityId: 'generatorTwo',
        firstEntityMetaData: {},
        secondEntityMetaData: {},
        volume: '100000',
        from: new Date('2021-08-01T10:45:00.000Z'),
        to: new Date('2021-08-01T11:00:00.000Z')
    },
    {
        firstEntityId: 'consumerOne',
        secondEntityId: 'generatorThree',
        firstEntityMetaData: {},
        secondEntityMetaData: {},
        volume: '100000',
        from: new Date('2021-08-01T10:45:00.000Z'),
        to: new Date('2021-08-01T11:00:00.000Z')
    },
    {
        firstEntityId: 'consumerTwo',
        secondEntityId: 'generatorOne',
        firstEntityMetaData: {},
        secondEntityMetaData: {},
        volume: '100000',
        from: new Date('2021-08-01T10:45:00.000Z'),
        to: new Date('2021-08-01T11:00:00.000Z')
    },
    {
        firstEntityId: 'consumerTwo',
        secondEntityId: 'generatorOne',
        firstEntityMetaData: {},
        secondEntityMetaData: {},
        volume: '100000',
        from: new Date('2021-08-01T11:00:00.000Z'),
        to: new Date('2021-08-01T11:15:00.000Z')
    },
    {
        firstEntityId: 'consumerTwo',
        secondEntityId: 'generatorOne',
        firstEntityMetaData: {},
        secondEntityMetaData: {},
        volume: '100000',
        from: new Date('2021-08-01T11:15:00.000Z'),
        to: new Date('2021-08-01T11:30:00.000Z')
    }
];
