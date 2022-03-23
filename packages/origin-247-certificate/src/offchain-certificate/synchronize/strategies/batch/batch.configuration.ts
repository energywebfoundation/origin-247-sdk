import { Injectable } from '@nestjs/common';
import { CertificateConfigService } from '../../../../config/certificate-config.service';

export interface BatchConfiguration {
    issueBatchSize: number;
    claimBatchSize: number;
    transferBatchSize: number;
}

export const BATCH_CONFIGURATION_TOKEN = Symbol.for('BATCH_CONFIGURATION_TOKEN');

@Injectable()
export class BatchConfigurationService {
    constructor(private certificateConfigService: CertificateConfigService) {}

    getBatchSizes(): BatchConfiguration {
        return {
            // These variable and default values are properly handled by ConfigModule,
            // but version 1.0.2 of `@nestjs/config` doesn't allow to infer the type as `number`
            issueBatchSize: this.certificateConfigService.get('ISSUE_BATCH_SIZE'),
            claimBatchSize: this.certificateConfigService.get('CLAIM_BATCH_SIZE'),
            transferBatchSize: this.certificateConfigService.get('TRANSFER_BATCH_SIZE')
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
