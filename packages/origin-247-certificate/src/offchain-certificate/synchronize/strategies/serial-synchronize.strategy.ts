import { SynchronizeStrategy } from './synchronize.strategy';
import { SynchronizableEvent } from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { Injectable } from '@nestjs/common';
import { PersistProcessor } from '../handlers/persist.handler';

@Injectable()
export class SerialSynchronizeStrategy implements SynchronizeStrategy {
    constructor(private readonly persistProcessor: PersistProcessor) {}

    async synchronize(events: SynchronizableEvent[]): Promise<void> {
        const sortedEvents = events.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        for (const event of sortedEvents) {
            await this.persistProcessor.handle(event);
        }
    }
}
