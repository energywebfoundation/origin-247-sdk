import { omit, cloneDeep, groupBy } from 'lodash';
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
    type RoutedEntity<T extends Entity, P extends Entity> = T & { routes: P[] };
    type Route<T extends Entity, P extends Entity> = [RoutedEntity<T, P>, RoutedEntity<P, T>];

    interface RoundInput<T extends Entity, P extends Entity> {
        routes: Route<T, P>[];
        entityWithRoutes: [RoutedEntity<T, P>[], RoutedEntity<P, T>[]];
        entityGroups: [RoutedEntity<T, P>[], RoutedEntity<P, T>[]];
    }

    interface GetMatchingRoundParams<T extends Entity, P extends Entity> {
        groupPriority: {
            id: string;
            groupPriority: { id: string }[][];
        }[][];
        entityGroups: [RoutedEntity<T, P>[], RoutedEntity<P, T>[]];
    }

    interface MatchRoundResult<T extends Entity, P extends Entity> {
        entities: Route<T, P>;
        volume: BigNumber;
    }

    /**
     * @NOTE
     *
     * READ BEFORE CHANGING ANYTHING IN THE CODE
     *
     * ==============================
     * This code relies heavily on identity equality.
     * Entities are cloned at the beginning, and since then,
     * reference cannot be lost
     *
     * Because entities may contain many fields, that are not supported by algorithm,
     * we would not know how to differentiate them: `id` can be not sufficient in many cases.
     * For example we can have different certificates for the same generator.
     * At the same, priority groups will work with `id` only.
     *
     * This is why entities are differentiated using strict equality.
     * Multiple entities with the same `id` will be treated as belonging to the same priority group,
     * therefore they will be consumed/satisfied equally.
     *
     * Also many places, that may seem not declarative or strange may be made that way for performance reasons.
     * Check for performance pull requests to see changes.
     * ==============================
     */

    /**
     * Perform match of entityGroups according to groupPriority.
     * For equal priorities of entities, they are used up equally - thus spread.
     */
    export const spreadMatcher = <T extends Entity, P extends Entity>(
        originalData: Params<T, P>
    ): Result<T, P> => {
        const clonedData = cloneDeep(originalData);
        const data = {
            ...clonedData,
            entityGroups: [
                clonedData.entityGroups[0].map((e) => ({ ...e, routes: [] as P[] })),
                clonedData.entityGroups[1].map((e) => ({ ...e, routes: [] as T[] }))
            ]
        } as GetMatchingRoundParams<T, P>;

        // We create simple Map for quick access during removing volumes in match
        const entityMap = [
            new Map(data.entityGroups[0].map((e) => [e, e])),
            new Map(data.entityGroups[1].map((e) => [e, e]))
        ] as const;

        const matchRoundResults = [] as MatchRoundResult<T, P>[][];

        let i = 0;
        while ((i += 1)) {
            if (i > 10_000) {
                throw new Error(`
                  Matching executed more than 10_000 - it may mean, that something broke
                  data: ${JSON.stringify(clonedData)}
                  matches: not displayed, because of potential length
                `);
            }

            if (data.entityGroups[0].length === 0 || data.entityGroups[1].length === 0) {
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
                const entity1 = entityMap[0].get(match.entities[0])!;
                const entity2 = entityMap[1].get(match.entities[1])!;

                entity1.volume = entity1.volume.sub(match.volume);
                entity2.volume = entity2.volume.sub(match.volume);
            });

            matchRoundResults.push(roundMatches);
            data.entityGroups = roundInput.entityGroups;
        }

        // We remove routes, because they have circular dependency, and Jest doesn't like that
        // (end user probably doesn't like that too)
        // Type correctness is ensured by spread matcher result
        data.entityGroups[0].forEach((e: any) => delete e.routes);
        data.entityGroups[1].forEach((e: any) => delete e.routes);
        matchRoundResults.flat().forEach((m) => m.entities.forEach((e: any) => delete e.routes));

        return {
            matches: sumMatches(matchRoundResults.flat()).map(omitMatchVolumes) as Match<T, P>[],
            roundMatches: matchRoundResults,
            leftoverEntities: [
                data.entityGroups[0].filter((e) => e.volume.gt(0)),
                data.entityGroups[1].filter((e) => e.volume.gt(0))
            ] as [T[], P[]]
        };
    };

    const omitMatchVolumes = <T extends Entity, P extends Entity>(match: Match<T, P>) => {
        return {
            ...match,
            entities: match.entities.map((e) => omit(e, 'volume'))
        };
    };

    /**
     * Multiple matches for the same entities (routes) can happen,
     * and we want sum of these.
     */
    const sumMatches = <T extends Entity, P extends Entity>(
        matches: Match<T, P>[]
    ): Match<T, P>[] => {
        const matchMap = new Map<Omit<T, 'volume'>, Map<Omit<P, 'volume'>, BigNumber>>();

        // Insert entities into Map for quick access
        // and sum volumes
        matches.forEach((match) => {
            const entity1Entry =
                matchMap.get(match.entities[0]) ?? new Map<Omit<P, 'volume'>, BigNumber>();

            matchMap.set(match.entities[0], entity1Entry);

            const entity2Entry = entity1Entry.get(match.entities[1]) ?? BigNumber.from(0);

            entity1Entry.set(match.entities[1], entity2Entry.add(match.volume));
        });

        // Unwind Map result
        const entity1Entries = Array.from(matchMap.entries());
        const result = entity1Entries.map(([entity1, entity1Entry]) => {
            const entity2Entries = Array.from(entity1Entry.entries());

            return entity2Entries.map(([entity2, volume]) => ({
                entities: [entity1, entity2],
                volume
            }));
        });

        return result.flat() as Match<T, P>[];
    };

    /**
     * Given two set of entities it checks how much volume should be distributed in each match round.
     * It's not optimal, but it's safe - it divides entity volumes over entities count that are connected via route,
     * and that's easiest method to compute volume, that can be distributed without any errors in algorithm.
     */
    const computeSafeDistribution = <T extends Entity, P extends Entity>(
        entities1: RoutedEntity<T, P>[],
        entities2: RoutedEntity<P, T>[]
    ) => {
        const result = bigNumMinBy([...entities1, ...entities2], (e) =>
            e.volume.div(e.routes.length)
        );

        return {
            entity: result,
            volume: result.volume.div(result.routes.length)
        };
    };

    /**
     * Create matches
     */
    const matchRound = <T extends Entity, P extends Entity>(
        input: RoundInput<T, P>
    ): MatchRoundResult<T, P>[] => {
        const toDistribute = computeSafeDistribution(
            input.entityWithRoutes[0],
            input.entityWithRoutes[1]
        );

        if (toDistribute.volume.eq(0)) {
            const competingEntities = toDistribute.entity.routes;

            // We need to check to which group entity to distribute belongs
            const isEntityFirst = input.entityWithRoutes[0].some((e) => e === toDistribute.entity);

            // Each competing entity will receive one volume from entity to distribute,
            const entitiesToSatisfy = competingEntities.slice(
                0,
                toDistribute.entity.volume.toNumber()
            );

            const result = entitiesToSatisfy.map((connectedEntity) => ({
                entities: (isEntityFirst
                    ? [toDistribute.entity, connectedEntity]
                    : [connectedEntity, toDistribute.entity]) as Route<T, P>,
                volume: BigNumber.from(1)
            }));

            return result;
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
        data: GetMatchingRoundParams<T, P>
    ): RoundInput<T, P> => {
        const entities = [
            prepareEntitiesForRoundInput(data.entityGroups[0]),
            prepareEntitiesForRoundInput(data.entityGroups[1])
        ] as const;

        const entity1Group = getFirstUsableGroup(data.groupPriority, entities[0].grouped);

        const routes = entity1Group.flatMap((entity1GroupEntry) => {
            const preferredEntity2Group = getFirstUsableGroup(
                entity1GroupEntry.groupPriority,
                entities[1].grouped
            );

            return cartesian(
                entity1GroupEntry.entities,
                preferredEntity2Group.flatMap((g) => g.entities)
            );
        });

        routes.forEach(([entity1, entity2]) => {
            entity1.routes.push(entity2);
            entity2.routes.push(entity1);
        });

        return {
            routes,
            entityWithRoutes: [
                entities[0].flat.filter((entity) => entity.routes.length > 0),
                entities[1].flat.filter((entity) => entity.routes.length > 0)
            ],
            entityGroups: [entities[0].flat, entities[1].flat]
        };
    };

    /**
     * Prepare entities for next matching round:
     * 1. Filter out entities that are 0 volume
     * 2. Reset entities routes
     * 3. Group entities by `id` for fast access
     */
    const prepareEntitiesForRoundInput = <T extends Entity, P extends Entity>(
        entities: RoutedEntity<T, P>[]
    ): { grouped: Record<string, RoutedEntity<T, P>[]>; flat: RoutedEntity<T, P>[] } => {
        const grouped: Record<string, RoutedEntity<T, P>[]> = {};
        const flat: RoutedEntity<T, P>[] = [];
        const entitiesLength = entities.length;

        for (let i = 0; i < entitiesLength; i += 1) {
            const entity = entities[i];

            if (entity.volume.eq(0)) {
                continue;
            }

            entity.routes = [];

            if (!(entity.id in grouped)) {
                grouped[entity.id] = [];
            }

            grouped[entity.id].push(entity);
            flat.push(entity);
        }

        return {
            grouped,
            flat
        };
    };

    /**
     * Given groups, and related entities with volumes
     * it returns first group that has any volume left.
     */
    const getFirstUsableGroup = <T extends { id: string }, P extends Entity>(
        groups: T[][],
        entities: Record<string, P[]>
    ): (T & { entities: P[] })[] => {
        const groupsWithEntities = groups.map((group) => {
            const groupWithEntities = group.map((entry) => ({
                ...entry,
                entities: entities[entry.id] ?? []
            }));

            return groupWithEntities;
        });

        const firstAvailableEntry = groupsWithEntities.find((group) =>
            group.some((g) => g.entities.length > 0)
        );

        return firstAvailableEntry ?? [];
    };

    const bigNumMinBy = <T>(collection: T[], cb: (v: T) => BigNumber): T => {
        let minResult = cb(collection[0]);
        let minItem = collection[0];

        for (let i = 0; i < collection.length; i += 1) {
            const currentResult = cb(collection[i]);

            if (currentResult.lt(minResult)) {
                minItem = collection[i];
                minResult = currentResult;
            }
        }

        return minItem;
    };

    const cartesian = <T, P>(arr1: T[], arr2: P[]): [T, P][] => {
        return arr1.flatMap((val1) => arr2.map((val2) => [val1, val2] as [T, P]));
    };
}
