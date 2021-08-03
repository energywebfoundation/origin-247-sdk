import { NewMatchResult } from '../src/repositories/MatchResult.repository';
import { MatchResultInMemoryRepository } from '../src/repositories/MatchResultInMemory.repository';

describe('MatchResultInMemoryRepository', () => {
    const repo = new MatchResultInMemoryRepository();

    beforeEach(async () => {
        await seed();
    });

    afterEach(async () => {
        await repo.deleteAll();
    });

    it('should add MatchResult', async () => {
        let res = await repo.find();
        expect(res).toHaveLength(5);

        await repo.create(matches[0]);
        res = await repo.find();
        expect(res).toHaveLength(6);
    });

    it('should return all records when no findOptions are specified', async () => {
        const res = await repo.find();
        expect(res).toHaveLength(5);
    });

    it('should find by firstEntityId', async () => {
        const res = await repo.find({ firstEntityId: ['consumerOne'] });
        expect(res).toHaveLength(3);
    });

    it('should find by multiple firstEntityId', async () => {
        const res = await repo.find({ firstEntityId: ['consumerOne', 'consumerTwo'] });
        expect(res).toHaveLength(5);
    });

    it('should find by secondEntityId', async () => {
        const res = await repo.find({ secondEntityId: ['generatorTwo'] });
        expect(res).toHaveLength(2);
    });

    it('should find by firstEntityId and secondEntityId', async () => {
        const res = await repo.find({
            firstEntityId: ['consumerOne'],
            secondEntityId: ['generatorOne']
        });
        expect(res).toHaveLength(2);
    });

    it('should find by from date', async () => {
        const res = await repo.find({
            from: new Date('2021-08-01T11:00:00.000Z')
        });
        expect(res).toHaveLength(1);
    });

    it('should find by to date', async () => {
        const res = await repo.find({
            to: new Date('2021-08-01T11:00:00.000Z')
        });
        expect(res).toHaveLength(4);
    });

    it('should find by from and to date', async () => {
        const res = await repo.find({
            from: new Date('2021-08-01T10:45:00.000Z'),
            to: new Date('2021-08-01T11:00:00.000Z')
        });
        expect(res).toHaveLength(3);
    });

    async function seed() {
        await Promise.all([
            repo.create(matches[0]),
            repo.create(matches[1]),
            repo.create(matches[2]),
            repo.create(matches[3]),
            repo.create(matches[4])
        ]);
    }
});

const matches: NewMatchResult[] = [
    {
        firstEntityId: 'consumerOne',
        secondEntityId: 'generatorOne',
        volume: '100',
        firstEntityMetaData: {},
        secondEntityMetaData: {},
        from: new Date('2021-08-01T10:30:00.000Z'),
        to: new Date('2021-08-01T10:45:00.000Z')
    },
    {
        firstEntityId: 'consumerOne',
        secondEntityId: 'generatorOne',
        volume: '100',
        firstEntityMetaData: {},
        secondEntityMetaData: {},
        from: new Date('2021-08-01T11:00:00.000Z'),
        to: new Date('2021-08-01T11:15:00.000Z')
    },
    {
        firstEntityId: 'consumerOne',
        secondEntityId: 'generatorTwo',
        volume: '100',
        firstEntityMetaData: {},
        secondEntityMetaData: {},
        from: new Date('2021-08-01T10:45:00.000Z'),
        to: new Date('2021-08-01T11:00:00.000Z')
    },
    {
        firstEntityId: 'consumerTwo',
        secondEntityId: 'generatorOne',
        volume: '100',
        firstEntityMetaData: {},
        secondEntityMetaData: {},
        from: new Date('2021-08-01T10:45:00.000Z'),
        to: new Date('2021-08-01T11:00:00.000Z')
    },
    {
        firstEntityId: 'consumerTwo',
        secondEntityId: 'generatorTwo',
        volume: '100',
        firstEntityMetaData: {},
        secondEntityMetaData: {},
        from: new Date('2021-08-01T10:45:00.000Z'),
        to: new Date('2021-08-01T11:00:00.000Z')
    }
];
