import { IClaimCommand, IIssueCommand } from '../../../types';
import { PersistHandler } from './persist.handler';
import {
    CertificateEventRepository,
    ProcessableEvent
} from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateEventType } from '../../events/Certificate.events';
import { CertificateCommandEntity } from '../../repositories/CertificateCommand/CertificateCommand.entity';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { CertificateService } from '../../../certificate.service';
import { OffchainCertificateService } from '../../offchain-certificate.service';
import { Inject } from '@nestjs/common';
import { CERTIFICATE_EVENT_REPOSITORY } from '../../repositories/repository.keys';

export class ClaimPersistHandler implements PersistHandler {
    constructor(
        private readonly certificateService: CertificateService,
        private readonly offchainCertificateService: OffchainCertificateService,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository
    ) {}

    public canHandle(event: ProcessableEvent) {
        return event.type === CertificateEventType.Claimed;
    }

    public async handle(event: CertificateEventEntity, command: CertificateCommandEntity) {
        await this.certificateService.claim(command.payload as IClaimCommand);

        await this.offchainCertificateService.claimPersisted(event.internalCertificateId, {});
        await this.certEventRepo.markAsSynchronized(event.id);
    }
}
