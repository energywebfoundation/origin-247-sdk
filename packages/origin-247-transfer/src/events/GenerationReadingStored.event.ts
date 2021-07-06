import { BigNumber } from 'ethers';

export interface GenerationReadingStoredPayload<T = null> {
    generatorId: string;
    fromTime: Date;
    toTime: Date;
    ownerBlockchainAddress: string;
    energyValue: string;
    metadata: T;
}

export class GenerationReadingStoredEvent<T = null> {
    constructor(public data: GenerationReadingStoredPayload<T>) {}
}
