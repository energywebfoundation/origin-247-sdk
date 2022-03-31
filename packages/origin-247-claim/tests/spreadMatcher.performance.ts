import { SpreadMatcher } from '../src';
import { times, sampleSize } from 'lodash';
import { BigNumber } from '@ethersproject/bignumber';

const createEntityGroups = (n: number, prefix: string, volume: number) => {
    return times(n, (i) => ({
        id: `${prefix}-${i}`,
        volume: BigNumber.from(volume)
    }));
};

const createPriorities = (n1: number, n2: number, prefix1: string, prefix2: string) => {
    const generators = times(n2, (i2) => ({
        id: `${prefix2}-${i2}`
    }));

    return times(n1, (i1) => ({
        id: `${prefix1}-${i1}`,
        groupPriority: [
            sampleSize(generators, numberOfGeneratorsInPriorityGroup),
            sampleSize(generators, numberOfGeneratorsInPriorityGroup)
        ]
    }));
};

const testPerf = (
    numberOfGenerators: number,
    numberOfConsumers: number
): {
    generators: number;
    consumers: number;
    timeData: number;
    timeMatch: number;
    matches: number;
} => {
    const start = Date.now();

    console.log(
        `Starting perf test for: ${numberOfGenerators} generators and ${numberOfConsumers} consumers`
    );

    const dataStart = Date.now();

    const entities = [
        createEntityGroups(numberOfConsumers, consumerPrefix, 5_000),
        createEntityGroups(numberOfGenerators, generatorPrefix, 10_000)
    ] as any;

    const priorities = [
        createPriorities(numberOfConsumers, numberOfGenerators, consumerPrefix, generatorPrefix)
    ];

    const dataEnd = Date.now();

    const matchStart = Date.now();

    console.log(`Staring matching`);

    const result = SpreadMatcher.spreadMatcher({
        entityGroups: entities,
        groupPriority: priorities
    });

    const matchEnd = Date.now();

    const end = Date.now();

    console.log(`Test finished after ${end - start}ms`);

    return {
        generators: numberOfGenerators,
        consumers: numberOfConsumers,
        timeData: dataEnd - dataStart,
        timeMatch: matchEnd - matchStart,
        matches: result.matches.length
    };
};

const generatorPrefix = 'gen';
const consumerPrefix = 'con';
const numberOfGeneratorsInPriorityGroup = 1;

const results = [
    // testPerf(50, 50),
    // testPerf(100, 100),
    // testPerf(500, 500),
    // testPerf(1000, 1000),
    testPerf(1000, 10000)
];

console.table(results);
