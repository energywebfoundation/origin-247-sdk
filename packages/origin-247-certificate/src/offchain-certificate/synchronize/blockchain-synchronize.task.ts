import { Inject, Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import {
    CERTIFICATE_EVENT_REPOSITORY,
    SYNCHRONIZE_QUEUE_NAME
} from '../repositories/repository.keys';
import { CertificateEventRepository } from '../repositories/CertificateEvent/CertificateEvent.repository';
import { SYNCHRONIZE_STRATEGY, SynchronizeStrategy } from './strategies/synchronize.strategy';

const SYNCHRONIZATION_CONCURRENCY = 1;

@Injectable()
@Processor(SYNCHRONIZE_QUEUE_NAME)
export class BlockchainSynchronizeTask {
    private readonly logger = new Logger(BlockchainSynchronizeTask.name);

    constructor(
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,

        @Inject(SYNCHRONIZE_STRATEGY)
        private readonly synchronizeStrategy: SynchronizeStrategy
    ) {}

    @Process({ concurrency: SYNCHRONIZATION_CONCURRENCY })
    async synchronizeWithBlockchain(): Promise<void> {
        try {
            this.logger.debug(`Synchronization with blockchain started at ${new Date()}`);

            let i = 0;
            while (i < 50) {
                // This basically limits how many events we want to process in one task execution
                console.time('certEventRepo.findAllToProcess');
                const events = await this.certEventRepo.findAllToProcess({
                    limit: 500
                });
                console.timeEnd('certEventRepo.findAllToProcess');
                if (events.length === 0) {
                    break;
                }

                console.time('synchronizeStrategy.synchronize');
                await this.synchronizeStrategy.synchronize(events);
                console.timeEnd('synchronizeStrategy.synchronize');

                i += 1;
            }

            this.logger.debug(`Synchronization with blockchain finished at ${new Date()}`);
        } catch (e) {
            this.logger.error(
                `Error occurred while synchronizing certificates with blockchain: ${e.message}`,
                e.stack
            );

            throw e;
        }
    }
}
