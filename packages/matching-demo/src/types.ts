import { SpreadMatcher } from '@energyweb/origin-247-claim/dist/js/src/algorithms';

export type Match = SpreadMatcher.Match<SpreadMatcher.Entity, SpreadMatcher.Entity>;

export interface IPriority {
    id: string;
    groupPriority: { id: string }[][];
}
