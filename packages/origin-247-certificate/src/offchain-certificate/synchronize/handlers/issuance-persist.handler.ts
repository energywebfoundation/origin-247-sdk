import { IIssueCommand } from '../../../types';
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

export class IssuancePersistHandler implements PersistHandler {
    constructor(
        private readonly certificateService: CertificateService,
        private readonly offchainCertificateService: OffchainCertificateService,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository
    ) {}

    public canHandle(event: ProcessableEvent) {
        return event.type === CertificateEventType.Issued;
    }

    public async handle(event: CertificateEventEntity, command: CertificateCommandEntity) {
        const commandPayload = command.payload as IIssueCommand<any>;
        const certificate = await this.certificateService.issue({
            ...commandPayload,
            fromTime: new Date(commandPayload.fromTime),
            toTime: new Date(commandPayload.toTime)
        });

        await this.offchainCertificateService.issuePersisted(event.internalCertificateId, {
            blockchainCertificateId: certificate.id
        });
        await this.certEventRepo.markAsSynchronized(event.id);
    }

    async handleBatch(
        events: CertificateEventEntity[],
        commands: CertificateCommandEntity[]
    ): Promise<void> {
        const certificateIds = await this.certificateService.batchIssue(
            commands
                .map((command) => command.payload as IIssueCommand<any>)
                .map((payload) => ({
                    ...payload,
                    fromTime: new Date(payload.fromTime),
                    toTime: new Date(payload.toTime)
                }))
        );

        await Promise.all(
            events.map(async (event, index) => {
                await this.offchainCertificateService.issuePersisted(event.internalCertificateId, {
                    blockchainCertificateId: certificateIds[index]
                });
                await this.certEventRepo.markAsSynchronized(event.id);
            })
        );
    }
}
