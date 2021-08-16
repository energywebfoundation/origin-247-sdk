import { BigNumber } from 'ethers';

export interface IConsumerPriority {
    consumerId: string;
    generatorPriority: IGeneratorPreference[][];
}

export interface IGeneratorPreference {
    generatorId: string;
}

export interface IConsumption {
    consumerId: string;
    volume: BigNumber;
}
export interface IGeneration {
    generatorId: string;
    volume: BigNumber;
    certificateId: number;
}
export interface IMatchingInput {
    consumptions: IConsumption[];
    generations: IGeneration[];
}

export interface IMatchingOutput {
    matches: IMatch<IConsumption, IGeneration>[];
    leftoverConsumptions: IConsumption[];
    excessGenerations: IGeneration[];
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
