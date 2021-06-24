import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bull';
import { CertificateModule as IssuerCertificateModule } from '@energyweb/issuer-api';

import { CertificateService } from './certificate.service';
import { BlockchainActionsProcessor } from './blockchain-actions.processor';

@Module({
    providers: [CertificateService, BlockchainActionsProcessor],
    exports: [CertificateService],
    imports: [
        IssuerCertificateModule,
        CqrsModule,
        BullModule.registerQueue({
            name: 'blockchain-actions'
        })
    ]
})
export class CertificateModule {}
