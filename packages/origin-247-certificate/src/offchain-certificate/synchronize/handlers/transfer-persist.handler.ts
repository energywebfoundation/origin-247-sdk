import { CERTIFICATE_SERVICE_TOKEN, OFFCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../../../types';
import { PersistHandler } from './persist.handler';
import {
    CertificateEventRepository,
    SynchronizableEvent
} from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateEventType, CertificateTransferredEvent } from '../../events/Certificate.events';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { CertificateService } from '../../../certificate.service';
import { OffchainCertificateService } from '../../offchain-certificate.service';
import { Inject, Injectable } from '@nestjs/common';
import { CERTIFICATE_EVENT_REPOSITORY } from '../../repositories/repository.keys';

@Injectable()
export class TransferPersistHandler implements PersistHandler {
    constructor(
        @Inject(CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: CertificateService,
        @Inject(OFFCHAIN_CERTIFICATE_SERVICE_TOKEN)
        private readonly offchainCertificateService: OffchainCertificateService,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository
    ) {}

    public canHandle(event: SynchronizableEvent) {
        return event.type === CertificateEventType.Transferred;
    }

    public async handle(event: CertificateEventEntity) {
        const transferredEvent = event as CertificateTransferredEvent;

        const result = await this.certificateService.transfer(transferredEvent.payload);

        if (result.success) {
            await this.offchainCertificateService.transferPersisted(
                event.internalCertificateId,
                {}
            );
        } else {
            await this.offchainCertificateService.persistError(event.internalCertificateId, {
                errorMessage: `[${result.statusCode}] ${result.message}`
            });
        }
    }
}
