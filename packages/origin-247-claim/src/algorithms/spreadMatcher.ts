import { omit, cloneDeep } from 'lodash';
import { BigNumber } from '@ethersproject/bignumber';

export namespace SpreadMatcher {
    /**
     * Entity, that will be distributed over another entities
     */
    export interface Entity {
        id: string;
        volume: BigNumber;
    }

    export interface Params<T extends Entity, P extends Entity> {
        /** First entity group priority */
        groupPriority: {
            id: string;
            /** Second entity group priority */
            groupPriority: { id: string }[][];
        }[][];
        entityGroups: [T[], P[]];
    }

    export interface Match<T extends Entity, P extends Entity> {
        /** Volumes are omitted to avoid confusion, though they are expected to be 0 */
        entities: [Omit<T, 'volume'>, Omit<P, 'volume'>];
        volume: BigNumber;
    }

    export interface Result<T extends Entity, P extends Entity> {
        matches: Match<T, P>[];
        roundMatches: Match<T, P>[][];
        leftoverEntities: [T[], P[]];
    }

    /** Possible connection between two entities (one will satisfy another) */
    type Route<T extends Entity, P extends Entity> = [T, P];

    interface RoundInput<T extends Entity, P extends Entity> {
        routes: Route<T, P>[];
        entityGroups: [T[], P[]];
    }

    /**
     * @NOTE
     *
     * ==============================
     * This code relies heavily on identity equality.
     * Entities are cloned at the beginning, and since then,
     * reference cannot be lost
     *
     * Because entities may contain many fields, that are not supported by algorithm,
     * we would not know how to differentiate them: `id` can be not sufficient in many cases.
     * At the same, priority groups will work with `id` only.
     *
     * This is why entities are differentiated using strict equality.
     * Multiple entities with the same `id` will be treated as belonging to the same priority group,
     * therefore they will be consumed/satisfied equally.
     * ==============================
     */

    /**
     * Perform match of entityGroups according to groupPriority.
     * For equal priorities of entities, they are used up equally - thus spread.
     */
    export const spreadMatcher = <T extends Entity, P extends Entity>(
        originalData: Params<T, P>
    ): Result<T, P> => {
        const data = cloneDeep(originalData);
        const allRoundMatches = [] as Match<T, P>[][];

        let i = 0;
        while ((i += 1)) {
            if (i > 10000) {
                throw new Error(`
                  Matching executed more than 10000 - it may mean, that something broke
                  data: ${JSON.stringify(data)}
                  matches: not displayed, because of potential length
                `);
            }

            const allGroupsHaveVolume = [
                data.entityGroups[0].some((v) => v.volume.gt(0)),
                data.entityGroups[1].some((v) => v.volume.gt(0))
            ].every(Boolean);

            if (!allGroupsHaveVolume) {
                break;
            }

            const roundInput = getRoundInput(data);

            // No routes can be computed
            // if there is some consumption/generation left,
            // but it won't be used because of missing priorities
            if (roundInput.routes.length === 0) {
                break;
            }

            const roundMatches = matchRound(roundInput);

            roundMatches.forEach((match) => {
                const entity1 = data.entityGroups[0].find((e) => e === match.entities[0])!;
                const entity2 = data.entityGroups[1].find((e) => e === match.entities[1])!;

                entity1.volume = entity1.volume.sub(match.volume);
                entity2.volume = entity2.volume.sub(match.volume);
            });

            allRoundMatches.push(roundMatches);
        }

        return {
            matches: sumMatches(allRoundMatches.flat()).map(omitMatchVolumes) as Match<T, P>[],
            roundMatches: allRoundMatches,
            leftoverEntities: data.entityGroups
        };
    };

    const omitMatchVolumes = <T extends Entity, P extends Entity>(match: Match<T, P>) => {
        return {
            ...match,
            entities: match.entities.map((e) => omit(e, 'volume'))
        };
    };

    /**
     * Multiple matches for the same entities can happen,
     * and we want sum of these.
     */
    const sumMatches = <T extends Entity, P extends Entity>(
        matches: Match<T, P>[]
    ): Match<T, P>[] => {
        const areMatchesSame = (match1: Match<T, P>, match2: Match<T, P>) => {
            return (
                match1.entities[0] === match2.entities[0] &&
                match1.entities[1] === match2.entities[1]
            );
        };

        return matches.reduce((sum, match) => {
            const existingMatchIndex = sum.findIndex((s) => areMatchesSame(s, match));

            if (existingMatchIndex >= 0) {
                return sum.map((m, i) => {
                    if (i === existingMatchIndex) {
                        return {
                            ...m,
                            volume: m.volume.add(match.volume)
                        };
                    } else {
                        return m;
                    }
                });
            }

            return [...sum, match];
        }, [] as Match<T, P>[]);
    };

    /**
     * Given two set of entities it checks how much volume should be distributed in each match round.
     * It's not optimal, but it's safe - it divides entity volumes over entities count that are connect via route,
     * and that's easiest method to compute volume, that can be distributed without any errors in algorithm.
     */
    const computeSafeDistribution = <T extends Entity, P extends Entity>(
        entities1: T[],
        entities2: P[],
        routes: Route<T, P>[]
    ) => {
        const computeDistributedVolume = (entities: (T | P)[]) =>
            entities.map((entity) => ({
                entity,
                volume: entity.volume.div(getCompetingEntities(routes, entity).length)
            }));

        return bigNumMinBy(
            [...computeDistributedVolume(entities1), ...computeDistributedVolume(entities2)],
            (e) => e.volume
        );
    };

    /**
     * Return entities, that are connected to given entity by a route.
     * This way we can find all entities that will be competing over another entity.
     */
    const getCompetingEntities = <T extends Entity, P extends Entity>(
        routes: Route<T, P>[],
        entity: T | P
    ) => {
        return routes
            .filter((route) => route.includes(entity))
            .flat()
            .filter((competingEntity) => competingEntity !== entity);
    };

    /**
     * Create matches
     */
    const matchRound = <T extends Entity, P extends Entity>(
        input: RoundInput<T, P>
    ): Match<T, P>[] => {
        const toDistribute = computeSafeDistribution(
            input.entityGroups[0],
            input.entityGroups[1],
            input.routes
        );

        if (toDistribute.volume.eq(0)) {
            const competingEntities = getCompetingEntities(input.routes, toDistribute.entity);

            // We need to check to which group entity to distribute belongs
            const isEntityFirst = input.entityGroups[0].find((e) => e === toDistribute.entity);

            // Each competing entity will receive one volume from entity to distribute,
            const entitiesToSatisfy = competingEntities.slice(
                0,
                toDistribute.entity.volume.toNumber()
            );

            return entitiesToSatisfy.map((connectedEntity) => ({
                entities: (isEntityFirst
                    ? [toDistribute.entity, connectedEntity]
                    : [connectedEntity, toDistribute.entity]) as [T, P],
                volume: BigNumber.from(1)
            }));
        }

        return input.routes.map((route) => ({
            entities: route,
            volume: toDistribute.volume
        }));
    };

    /**
     * Return organized input for next matching round.
     *
     * It's purpose is to get first usable priority group (that has any volume),
     * and for that, get first usable priority of second group (that has any volume),
     * and make routes, that will be used for even spread.
     */
    const getRoundInput = <T extends Entity, P extends Entity>(
        data: Params<T, P>
    ): RoundInput<T, P> => {
        const entity1Group = getFirstUsableGroup(data.groupPriority, data.entityGroups[0]);

        const routes = entity1Group.flatMap((entity1GroupEntry) => {
            const preferredEntity2Group = getFirstUsableGroup(
                entity1GroupEntry.groupPriority,
                data.entityGroups[1]
            );

            return cartesian(
                entity1GroupEntry.entities,
                preferredEntity2Group.flatMap((g) => g.entities)
            );
        });

        return {
            routes,
            entityGroups: [
                data.entityGroups[0].filter((entity) => routes.some((e) => e[0].id === entity.id)),
                data.entityGroups[1].filter((entity) => routes.some((e) => e[1].id === entity.id))
            ]
        };
    };

    /**
     * Given groups, and related entities with volumes
     * it returns first group that has any volume left.
     */
    const getFirstUsableGroup = <T extends { id: string }, P extends Entity>(
        groups: T[][],
        entities: P[]
    ): (T & { entities: P[] })[] => {
        const entitiesWithVolume = entities.filter((e) => e.volume.gt(0));

        const groupsWithVolume = groups
            .map((group) => {
                const entitiesInGroup = group.map((entry) => ({
                    ...entry,
                    entities: entitiesWithVolume.filter((e) => e.id === entry.id)
                }));

                return entitiesInGroup;
            })
            .filter((group) => group.some((g) => g.entities.length > 0));

        return groupsWithVolume[0] ?? [];
    };

    const bigNumMinBy = <T>(collection: T[], cb: (v: T) => BigNumber): T => {
        return collection.reduce((smallest, current) => {
            return cb(current).lt(cb(smallest)) ? current : smallest;
        }, collection[0]);
    };

    const cartesian = <T, P>(arr1: T[], arr2: P[]): [T, P][] => {
        return arr1.flatMap((val1) => arr2.map((val2) => [val1, val2] as [T, P]));
    };
}
