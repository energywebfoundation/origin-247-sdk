import {
    CERTIFICATE_SERVICE_TOKEN,
    IClaimCommand,
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
import { Inject, Injectable } from '@nestjs/common';
import {
    CERTIFICATE_COMMAND_REPOSITORY,
    CERTIFICATE_EVENT_REPOSITORY
} from '../../repositories/repository.keys';
import { cannotFindCorrespondingCommandErrorMessage } from '../strategies/synchronize.errors';
import { CertificateCommandRepository } from '../../repositories/CertificateCommand/CertificateCommand.repository';

@Injectable()
export class ClaimPersistHandler implements PersistHandler {
    constructor(
        @Inject(CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: CertificateService,
        @Inject(OFFCHAIN_CERTIFICATE_SERVICE_TOKEN)
        private readonly offchainCertificateService: OffchainCertificateService,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,
        @Inject(CERTIFICATE_COMMAND_REPOSITORY)
        private readonly certCommandRepo: CertificateCommandRepository
    ) {}

    public canHandle(event: SynchronizableEvent) {
        return event.type === CertificateEventType.Claimed;
    }

    public async handle(event: CertificateEventEntity) {
        const command = await this.certCommandRepo.getById(event.commandId);

        if (!command) {
            await this.offchainCertificateService.persistError(event.internalCertificateId, {
                errorMessage: cannotFindCorrespondingCommandErrorMessage(event)
            });
            return;
        }

        const result = await this.certificateService.claim(command.payload as IClaimCommand);

        if (result.success) {
            await this.offchainCertificateService.claimPersisted(event.internalCertificateId, {});
        } else {
            await this.offchainCertificateService.persistError(event.internalCertificateId, {
                errorMessage: `[${result.statusCode}] ${result.message}`
            });
        }
    }
}
