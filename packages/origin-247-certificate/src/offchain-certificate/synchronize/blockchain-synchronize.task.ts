import { Inject, Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { BlockchainSynchronizeService } from './blockchain-synchronize.service';
import { CERTIFICATE_EVENT_REPOSITORY } from '../repositories/repository.keys';
import { CertificateEventRepository } from '../repositories/CertificateEvent/CertificateEvent.repository';
import { SYNCHRONIZE_STRATEGY, SynchronizeStrategy } from './strategies/synchronize.strategy';

const SYNCHRONIZATION_CONCURRENCY = 1;

export const blockchainSynchronizeQueueName = 'blockchain-synchronize';

@Injectable()
@Processor(blockchainSynchronizeQueueName)
export class BlockchainSynchronizeTask {
    private readonly logger = new Logger(BlockchainSynchronizeTask.name);

    constructor(
        private readonly blockchainSynchronizeService: BlockchainSynchronizeService,

        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,

        @Inject(SYNCHRONIZE_STRATEGY)
        private readonly synchronizeStrategy: SynchronizeStrategy
    ) {}

    @Process({ concurrency: SYNCHRONIZATION_CONCURRENCY })
    async synchronizeWithBlockchain(): Promise<void> {
        try {
            this.logger.debug(`Synchronization with blockchain started at ${new Date()}`);

            const events = await this.certEventRepo.getAllNotProcessed();
            await this.synchronizeStrategy.synchronize(events);

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
