import { SynchronizeStrategy } from './synchronize.strategy';
import {
    CertificateEventRepository,
    ProcessableEvent
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

    async synchronize(events: ProcessableEvent[]): Promise<void> {
        for (const event of events) {
            const command = await this.certCommandRepo.getById(event.commandId);

            if (!command) {
                await this.certEventRepo.saveProcessingError(
                    event.id,
                    `Cannot find command with id: ${event.commandId} corresponding to event ${event.id}`
                );

                continue;
            }

            await this.persistProcessor.handle(event, command);
        }
    }
}
