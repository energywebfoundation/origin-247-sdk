import {
    CERTIFICATE_SERVICE_TOKEN,
    IIssueCommand,
    OFFCHAIN_CERTIFICATE_SERVICE_TOKEN
} from '../../../types';
import { PersistHandler } from './persist.handler';
import {
    CertificateEventRepository,
    SynchronizableEvent
} from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateEventType } from '../../events/Certificate.events';
import { CertificateCommandEntity } from '../../repositories/CertificateCommand/CertificateCommand.entity';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { CertificateService } from '../../../certificate.service';
import { OffchainCertificateService } from '../../offchain-certificate.service';
import { Inject } from '@nestjs/common';
import { CERTIFICATE_EVENT_REPOSITORY } from '../../repositories/repository.keys';
import { cannotFindCorrespondingCommandErrorMessage } from '../strategies/synchronize.errors';

export class IssuancePersistHandler implements PersistHandler {
    constructor(
        @Inject(CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: CertificateService,
        @Inject(OFFCHAIN_CERTIFICATE_SERVICE_TOKEN)
        private readonly offchainCertificateService: OffchainCertificateService,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository
    ) {}

    public canHandle(event: SynchronizableEvent) {
        return event.type === CertificateEventType.Issued;
    }

    public async handle(event: CertificateEventEntity, command: CertificateCommandEntity | null) {
        if (!command) {
            await this.offchainCertificateService.persistError(event.internalCertificateId, {
                errorMessage: cannotFindCorrespondingCommandErrorMessage(event)
            });
            return;
        }

        const commandPayload = command.payload as IIssueCommand<any>;
        const certificate = await this.certificateService.issue({
            ...commandPayload,
            fromTime: new Date(commandPayload.fromTime),
            toTime: new Date(commandPayload.toTime)
        });

        if (certificate.id) {
            await this.offchainCertificateService.issuePersisted(event.internalCertificateId, {
                blockchainCertificateId: certificate.id
            });
        } else {
            await this.offchainCertificateService.persistError(event.internalCertificateId, {
                errorMessage: `Cannot issue certificate for certificate id: ${event.internalCertificateId}`
            });
        }
    }
}
