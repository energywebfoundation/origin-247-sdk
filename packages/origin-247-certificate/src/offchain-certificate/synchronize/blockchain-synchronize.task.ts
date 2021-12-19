import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue } from 'bull';
import { BlockchainSynchronizeService } from './blockchain-synchronize.service';

const EVERY_15_MINUTES = '*/15  * * * *';
const SYNCHRONIZATION_CONCURRENCY = 1;

export const blockchainSynchronizeQueueName = 'blockchain-synchronize';
export const synchronizationCron = process.env.BLOCKHCHAIN_SYNCHRONIZATION_CRON ?? EVERY_15_MINUTES;

@Injectable()
@Processor(blockchainSynchronizeQueueName)
export class BlockchainSynchronizeTask implements OnModuleInit {
    private readonly logger = new Logger(BlockchainSynchronizeTask.name);

    constructor(
        @InjectQueue(blockchainSynchronizeQueueName)
        private readonly synchronizationQueue: Queue,

        private readonly blockchainSynchronizeService: BlockchainSynchronizeService
    ) {}

    @Process({ concurrency: SYNCHRONIZATION_CONCURRENCY })
    async synchronizeWithBlockchain(): Promise<void> {
        try {
            this.logger.debug(`Synchronization with blockchain started at ${new Date()}`);
            await this.blockchainSynchronizeService.synchronize();
        } catch (e) {
            this.logger.error(
                `Error occurred while synchronizing certificates with blockchain: ${e.message}`,
                e.stack
            );

            throw e;
        }
    }

    async onModuleInit() {
        await this.synchronizationQueue.add({}, { repeat: { cron: synchronizationCron } });

        this.logger.debug(
            `Synchronization with blockchain set up and repeats at: ${synchronizationCron}`
        );
    }
}
