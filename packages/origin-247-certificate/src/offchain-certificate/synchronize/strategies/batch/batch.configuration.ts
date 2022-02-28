import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

export interface BatchConfiguration {
    issueBatchSize: number;
    claimBatchSize: number;
    transferBatchSize: number;
}

export const BATCH_CONFIGURATION_TOKEN = Symbol.for('BATCH_CONFIGURATION_TOKEN');

@Injectable()
export class BatchConfigurationService {
    constructor(private configService: ConfigService) {}

    getBatchSizes(): BatchConfiguration {
        const issueSize = this.configService.get('ISSUE_BATCH_SIZE');
        const claimSize = this.configService.get('CLAIM_BATCH_SIZE');
        const transferSize = this.configService.get('TRANSFER_BATCH_SIZE');

        return {
            issueBatchSize: issueSize ? parseInt(issueSize) : 10,
            claimBatchSize: claimSize ? parseInt(claimSize) : 25,
            transferBatchSize: transferSize ? parseInt(transferSize) : 100
        };
    }
}

@Injectable()
export class BatchConfigurationServiceForUnitTests {
    getBatchSizes(): BatchConfiguration {
        return {
            issueBatchSize: 10,
            claimBatchSize: 25,
            transferBatchSize: 100
        };
    }
}
