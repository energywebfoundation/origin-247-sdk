import { SpreadMatcher } from './algorithm/spreadMatcher';

export type Match = SpreadMatcher.Match<SpreadMatcher.Entity, SpreadMatcher.Entity>;

export interface IPriority {
    id: string;
    groupPriority: { id: string }[][];
}
