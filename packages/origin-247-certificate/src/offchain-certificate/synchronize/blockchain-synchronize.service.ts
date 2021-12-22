import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { blockchainSynchronizeQueueName } from './blockchain-synchronize.task';

@Injectable()
export class BlockchainSynchronizeService {
    constructor(
        @InjectQueue(blockchainSynchronizeQueueName)
        private readonly synchronizationQueue: Queue
    ) {}

    public async synchronize() {
        await this.synchronizationQueue.add({});
    }
}
