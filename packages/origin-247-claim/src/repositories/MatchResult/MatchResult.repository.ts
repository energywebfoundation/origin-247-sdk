import { MatchResultEntity } from './MatchResult.entity';

export const MATCH_RESULT_REPOSITORY = Symbol.for('MATCH_RESULT_REPOSITORY');

export interface FindOptions {
    consumerIds: string[];
    generatorIds: string[];
    from: Date;
    to: Date;
}

export interface GroupedMatchResults {
    firstEntityId?: string;
    secondEntityId?: string;
    entries: MatchResultEntity[];
}

export enum Entity {
    Consumer = 'consumerId',
    Generator = 'generatorId'
}

export enum MatchResultColumns {
    Id = 'id',
    ConsumerId = 'consumerId',
    GeneratorId = 'generatorId',
    Timestamp = 'timestamp',
    ConsumerMetadata = 'consumerMetadata',
    GeneratorMetadata = 'generatorMetadata',
    Volume = 'volume',
    CreatedAt = 'createdAt',
    UpdatedAt = 'updatedAt'
}

export type NewMatchResult = Omit<MatchResultEntity, 'id' | 'createdAt' | 'updatedAt'>;

export interface MatchResultRepository {
    create(matchResult: NewMatchResult): Promise<MatchResultEntity>;
    getAll(): Promise<MatchResultEntity[]>;
    find(findOptions: FindOptions): Promise<MatchResultEntity[]>;
    findGrouped(findOptions: FindOptions, groupOptions: Entity[]): Promise<GroupedMatchResults[]>;
}
