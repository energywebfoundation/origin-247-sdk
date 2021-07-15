import { groupBy, minBy, sumBy, cloneDeep } from 'lodash';

export interface SpreadMatcherData {
    priority: {
        id: string;
        priority: { id: string }[][];
    }[][];
    entityGroups: [SpreadMatcherEntity[], SpreadMatcherEntity[]];
}

export interface SpreadMatch {
    entities: [string, string];
    volume: number;
}

export interface SpreadMatcherResult {
    matches: SpreadMatch[];
    leftoverEntities: [SpreadMatcherEntity[], SpreadMatcherEntity[]];
}

export interface SpreadMatcherEntity {
    id: string;
    volume: number;
}

type Route = [string, string];

interface RoundInput {
    routes: Route[];
    entityGroups: [SpreadMatcherEntity[], SpreadMatcherEntity[]];
}

export const spreadMatcher = (originalData: SpreadMatcherData): SpreadMatcherResult => {
    const data = cloneDeep(originalData);
    const matches: SpreadMatch[][] = [];

    let i = 0;

    while (true) {
        if (i > 10000) {
            throw new Error(`
              Matching executed more than 10000 - it may mean, that something broke
              data: ${JSON.stringify(data, null, 2)}
              matches: not displayed, because of potential length
            `);
        }

        const allGroupsHaveVolume = [
            data.entityGroups[0].some((v) => v.volume > 0),
            data.entityGroups[1].some((v) => v.volume > 0)
        ].every(Boolean);

        if (!allGroupsHaveVolume) {
            break;
        }

        const roundMatches = matchRound(getRoundInput(data));

        roundMatches.forEach((match) => {
            data.entityGroups[0].find((c) => c.id === match.entities[0])!.volume -= match.volume;
            data.entityGroups[1].find((g) => g.id === match.entities[1])!.volume -= match.volume;
        });

        matches.push(roundMatches);

        i += 1;
    }

    return {
        matches: sumMatches(matches.flat()),
        leftoverEntities: data.entityGroups
    };
};

/**
 * Given matches sums them together - multiple matches for the same entities can happen,
 * and we want sum of these matches.
 */
const sumMatches = (matches: SpreadMatch[]): SpreadMatch[] => {
    return Object.values(groupBy(matches, (m) => `${m.entities[0]}${m.entities[1]}`)).map(
        (matches) => ({
            entities: matches[0].entities,
            volume: sumBy(matches, (m) => m.volume)
        })
    );
};

/**
 * Given two set of entities it checks how much volume should be distributed in each match round.
 * It's not optimal, but it's safe - it divides entity volumes over second entities count,
 * and that's easiest method to compute volume, that can be distributed without any errors in algorithm.
 */
const computeSafeDistribution = (
    entities1: SpreadMatcherEntity[],
    entities2: SpreadMatcherEntity[]
) => {
    const compute = (entities: SpreadMatcherEntity[], otherEntitiesLength: number) =>
        entities.map((entity) => ({
            entityId: entity.id,
            volume: entity.volume,
            distributedVolume: Math.floor(entity.volume / otherEntitiesLength)
        }));

    return minBy(
        [...compute(entities1, entities2.length), ...compute(entities2, entities1.length)],
        (e) => e.distributedVolume
    )!;
};

/**
 * Return entities, that are connected to given entity by a route.
 * This way we can find all entities that will be competing over another entity.
 */
const getCompetingEntites = (routes: Route[], entityId: string) => {
    return routes
        .filter((route) => route.includes(entityId))
        .flat()
        .filter((id) => id !== entityId);
};

/**
 * Create matches
 */
const matchRound = (input: RoundInput): SpreadMatch[] => {
    const entityToDistribute = computeSafeDistribution(
        input.entityGroups[0],
        input.entityGroups[1]
    );

    if (entityToDistribute.distributedVolume === 0) {
        const competetingEntities = getCompetingEntites(input.routes, entityToDistribute.entityId);

        // Since each entity will receive one volume, these numbers are equal
        const entitiesCountToUse = entityToDistribute.volume;

        // We need to check to which group entity to distribute belongs
        const isEntityFirst = input.entityGroups[0].find(
            (e) => e.id === entityToDistribute.entityId
        );

        return competetingEntities.slice(0, entitiesCountToUse).map((connectedEntity) => ({
            entities: isEntityFirst
                ? [entityToDistribute.entityId, connectedEntity]
                : [connectedEntity, entityToDistribute.entityId],
            volume: 1
        }));
    }

    return input.routes.map((route) => ({
        entities: route,
        volume: entityToDistribute.distributedVolume
    }));
};

/**
 * Return organized input for next matching rout
 */
const getRoundInput = (data: SpreadMatcherData): RoundInput => {
    const entity1round = getFirstUsableGroup(data.priority, data.entityGroups[0]);

    const routes = entity1round.flatMap((entity1) => {
        const prefferedEntity2Group = getFirstUsableGroup(entity1.priority, data.entityGroups[1]);

        return prefferedEntity2Group.map((entity2) => [entity1.id, entity2.id] as [string, string]);
    });

    return {
        routes,
        entityGroups: [
            data.entityGroups[0].filter((entity) => routes.some((e) => e[0] === entity.id)),
            data.entityGroups[1].filter((entity) => routes.some((e) => e[1] === entity.id))
        ]
    };
};

/**
 * Given groups, and related entities with volumes
 * it returns first group that has any volume left.
 * It also removes entries from group, that don't have any volume.
 */
const getFirstUsableGroup = <T extends { id: string }>(
    groups: T[][],
    data: SpreadMatcherEntity[]
) => {
    const groupsWithVolume = groups
        .map((group) => {
            const withVolume = group.map((entry) => ({
                ...entry,
                // it is possible that some entry in group has no data volume
                volume: data.find((c) => c.id === entry.id)?.volume ?? 0
            }));

            return withVolume.filter((entry) => entry.volume > 0);
        })
        .filter((group) => group.length > 0);

    return groupsWithVolume[0] ?? [];
};
