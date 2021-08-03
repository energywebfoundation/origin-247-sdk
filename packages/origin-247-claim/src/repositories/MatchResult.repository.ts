import { MatchResultEntity } from './MatchResult.entity';

export const MATCH_RESULT_REPOSITORY = Symbol.for('MATCH_RESULT_REPOSITORY');

export interface FindOptions {
    firstEntityId: string[];
    secondEntityId: string[];
    from: Date;
    to: Date;
}

export enum Entity {
    FirstEntity = 'firstEntityId',
    SecondEntity = 'secondEntityId'
}

export type NewMatchResult = Omit<MatchResultEntity, 'id' | 'createdAt' | 'updatedAt'>;

export interface MatchResultRepository {
    create(matchResult: NewMatchResult): Promise<MatchResultEntity>;
    getAll(): Promise<MatchResultEntity[]>;
    find(findOptions: FindOptions): Promise<MatchResultEntity[]>;
    findGrouped(findOptions: FindOptions, groupOptions: Entity[]);
}
