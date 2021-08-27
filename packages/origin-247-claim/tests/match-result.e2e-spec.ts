import { bootstrapTestInstance } from './setup-e2e';
import { INestApplication } from '@nestjs/common';
import { MatchResultRepository } from '../src/repositories/MatchResult/MatchResult.repository';
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

    describe('MatchResultRepository', () => {
        it('should create a match result', async () => {
            await matchResultRepository.create({
                consumerId: 'consumerOne',
                generatorId: 'generatorOne',
                consumerMetadata: {},
                generatorMetadata: {},
                volume: '100000',
                timestamp: new Date()
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
        timestamp: new Date('2021-08-01T11:00:00.000Z')
    },
    {
        consumerId: 'consumerOne',
        generatorId: 'generatorTwo',
        consumerMetadata: {},
        generatorMetadata: {},
        volume: '100000',
        timestamp: new Date('2021-08-01T11:00:00.000Z')
    },
    {
        consumerId: 'consumerOne',
        generatorId: 'generatorThree',
        consumerMetadata: {},
        generatorMetadata: {},
        volume: '100000',
        timestamp: new Date('2021-08-01T11:00:00.000Z')
    },
    {
        consumerId: 'consumerTwo',
        generatorId: 'generatorOne',
        consumerMetadata: {},
        generatorMetadata: {},
        volume: '100000',
        timestamp: new Date('2021-08-01T11:00:00.000Z')
    },
    {
        consumerId: 'consumerTwo',
        generatorId: 'generatorOne',
        consumerMetadata: {},
        generatorMetadata: {},
        volume: '100000',
        timestamp: new Date('2021-08-01T11:15:00.000Z')
    },
    {
        consumerId: 'consumerTwo',
        generatorId: 'generatorOne',
        consumerMetadata: {},
        generatorMetadata: {},
        volume: '100000',
        timestamp: new Date('2021-08-01T11:30:00.000Z')
    }
];
