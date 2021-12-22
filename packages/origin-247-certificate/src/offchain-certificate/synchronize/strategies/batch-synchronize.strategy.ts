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
import { CertificateEventType } from '../../events/Certificate.events';

@Injectable()
export class BatchSynchronizeStrategy implements SynchronizeStrategy {
    constructor(
        @Inject(CERTIFICATE_COMMAND_REPOSITORY)
        private readonly certCommandRepo: CertificateCommandRepository,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,
        private readonly persistProcessor: PersistProcessor
    ) {}

    async synchronize(events: SynchronizableEvent[]): Promise<void> {
        const commands = await this.certCommandRepo.getByIds(events.map((e) => e.commandId));

        const issueEvents = events.filter((e) => e.type === CertificateEventType.Issued);
        await this.persistProcessor.handleBatch(issueEvents, commands);

        const claimEvents = events.filter((e) => e.type === CertificateEventType.Claimed);
        await this.persistProcessor.handleBatch(claimEvents, commands);

        const transferEvents = events.filter((e) => e.type === CertificateEventType.Transferred);
        await this.persistProcessor.handleBatch(transferEvents, commands);
    }
}
