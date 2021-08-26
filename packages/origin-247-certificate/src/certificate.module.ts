import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bull';
import { IssuerModule } from '@energyweb/issuer-api';

import { CertificateService } from './certificate.service';
import { BlockchainActionsProcessor } from './blockchain-actions.processor';
import { CERTIFICATE_SERVICE_TOKEN } from './types';

const serviceProvider = {
    provide: CERTIFICATE_SERVICE_TOKEN,
    useClass: CertificateService
};

@Module({
    providers: [serviceProvider, BlockchainActionsProcessor],
    exports: [serviceProvider],
    imports: [
        IssuerModule.register({
            enableCertificationRequest: false,
            enableTransactionLogging: true
        }),
        CqrsModule,
        BullModule.registerQueue({
            name: 'blockchain-actions',
            settings: {
                lockDuration: Number(process.env.CERTIFICATE_QUEUE_LOCK_DURATION ?? 240 * 1000)
            }
        })
    ]
})
export class CertificateModule {}
