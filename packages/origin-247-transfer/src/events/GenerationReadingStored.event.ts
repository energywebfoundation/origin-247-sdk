import { BigNumber } from 'ethers';

export interface GenerationReadingStoredPayload<T = null> {
    deviceId: string;
    fromTime: Date;
    toTime: Date;
    ownerBlockchainAddress: string;
    energyValue: BigNumber;
    metadata: T;
}

export class GenerationReadingStoredEvent<T = null> {
    constructor(public data: GenerationReadingStoredPayload<T>) {}
}
