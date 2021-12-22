import {
    CERTIFICATE_SERVICE_TOKEN,
    ITransferCommand,
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
import { CERTIFICATE_EVENT_REPOSITORY } from '../../repositories/repository.keys';
import { cannotFindCorrespondingCommandErrorMessage } from '../strategies/synchronize.errors';

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

    public async handle(event: CertificateEventEntity, command: CertificateCommandEntity | null) {
        if (!command) {
            await this.offchainCertificateService.persistError(event.internalCertificateId, {
                errorMessage: cannotFindCorrespondingCommandErrorMessage(event)
            });
            return;
        }

        const result = await this.certificateService.transfer(command.payload as ITransferCommand);

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
