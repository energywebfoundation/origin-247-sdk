import { MatchResultEntity } from './MatchResult.entity';

enum Entity {
    FirstEntity = 'firstEntityId',
    SecondEntity = 'secondEntityId'
}
export interface MatchResultTransformOptions {
    groupBy: Entity[];
    filterBy: { entity: Entity; values: string }[];
}
