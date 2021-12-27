import { BigNumber } from '@ethersproject/bignumber';

export interface IConsumerPriority {
    consumerId: string;
    generatorPriority: IGeneratorPreference[][];
}

export interface IGeneratorPreference {
    generatorId: string;
}

export interface IConsumption {
    id: string;
    volume: BigNumber;
}
export interface IGeneration {
    id: string;
    volume: BigNumber;
    certificateId: number;
}
export interface IMatchingInput<T extends IConsumption, U extends IGeneration> {
    consumptions: T[];
    generations: U[];
}

export interface IMatchingOutput<T extends IConsumption, U extends IGeneration> {
    matches: IMatch<T, U>[];
    leftoverConsumptions: T[];
    excessGenerations: U[];
}

export interface IMatch<IConsumptionEntity, IGenerationEntity> {
    volume: BigNumber;
    consumption: Omit<IConsumptionEntity, 'volume'>;
    generation: Omit<IGenerationEntity, 'volume'>;
}

export interface ITimeFrame {
    from: Date;
    to: Date;
}
