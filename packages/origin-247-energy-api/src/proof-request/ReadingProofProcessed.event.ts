import { IEvent } from '@nestjs/cqrs';

export class ReadingProofProcessedEvent implements IEvent {
    constructor(
        public deviceId: string,
        public readings: {
            timestamp: Date;
            value: string;
        }[]
    ) {}
}
