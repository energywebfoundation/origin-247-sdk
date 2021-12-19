import { createBlockchainJob, SynchronizeStrategy } from './synchronize.strategy';
import {
    CERTIFICATE_EVENT_REPOSITORY,
    CertificateEventRepository,
    ProcessableEvent
} from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { Inject, Injectable } from '@nestjs/common';
import {
    CERTIFICATE_COMMAND_REPOSITORY,
    CertificateCommandRepository
} from '../../repositories/CertificateCommand/CertificateCommand.repository';
import { InjectQueue } from '@nestjs/bull';
import { blockchainQueueName } from '../../../blockchain-actions.processor';
import { Queue } from 'bull';
import { BlockchainAction } from '../../../types';

@Injectable()
export class SerialSynchronizeStrategy implements SynchronizeStrategy {
    constructor(
        @Inject(CERTIFICATE_COMMAND_REPOSITORY)
        private readonly certCommandRepo: CertificateCommandRepository,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,
        @InjectQueue(blockchainQueueName)
        private readonly blockchainActionsQueue: Queue<BlockchainAction>
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

            await this.blockchainActionsQueue.add(createBlockchainJob(event, command));
            await this.certEventRepo.markAsSynchronized(event.id);
        }
    }
}
