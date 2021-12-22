import { SynchronizeStrategy } from './synchronize.strategy';
import {
    CertificateEventRepository,
    SynchronizableEvent
} from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CertificateCommandRepository } from '../../repositories/CertificateCommand/CertificateCommand.repository';
import {
    CERTIFICATE_COMMAND_REPOSITORY,
    CERTIFICATE_EVENT_REPOSITORY
} from '../../repositories/repository.keys';
import { PersistProcessor } from '../handlers/persist.handler';

@Injectable()
export class SerialSynchronizeStrategy implements SynchronizeStrategy {
    constructor(
        @Inject(CERTIFICATE_COMMAND_REPOSITORY)
        private readonly certCommandRepo: CertificateCommandRepository,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,
        private readonly persistProcessor: PersistProcessor
    ) {}

    async synchronize(events: SynchronizableEvent[]): Promise<void> {
        const sortedEvents = events.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        for (const event of sortedEvents) {
            const command = await this.certCommandRepo.getById(event.commandId);

            await this.persistProcessor.handle(event, command);
        }
    }
}
