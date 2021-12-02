import { IEvent } from '@nestjs/cqrs';

export class ReadingProofProcessedEvent implements IEvent {
    constructor(
        public deviceId: string,
        public proofRootHash: string,
        public readings: {
            timestamp: Date;
            value: string;
            proofLeafHash: string;
        }[]
    ) {}
}
