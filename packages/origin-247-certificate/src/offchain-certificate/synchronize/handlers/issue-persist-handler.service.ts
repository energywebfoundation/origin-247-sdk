import { CERTIFICATE_SERVICE_TOKEN, OFFCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../../../types';
import { PersistHandler } from './persist.handler';
import { CertificateEventRepository } from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateEventType, CertificateIssuedEvent } from '../../events/Certificate.events';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { CertificateService } from '../../../certificate.service';
import { OffchainCertificateService } from '../../offchain-certificate.service';
import { Inject, Injectable } from '@nestjs/common';
import { CERTIFICATE_EVENT_REPOSITORY } from '../../repositories/repository.keys';

@Injectable()
export class IssuePersistHandler implements PersistHandler {
    constructor(
        @Inject(CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: CertificateService,
        @Inject(OFFCHAIN_CERTIFICATE_SERVICE_TOKEN)
        private readonly offchainCertificateService: OffchainCertificateService,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository
    ) {}

    public canHandle(event: CertificateEventEntity) {
        return event.type === CertificateEventType.Issued;
    }

    public async handle(event: CertificateEventEntity) {
        const issuedEvent = event as CertificateIssuedEvent<null>;

        const certificate = await this.certificateService.issue({
            ...issuedEvent.payload,
            fromTime: new Date(issuedEvent.payload.fromTime),
            toTime: new Date(issuedEvent.payload.toTime)
        });

        if (this.isCertificateIdValid(certificate?.id)) {
            await this.offchainCertificateService.issuePersisted(event.internalCertificateId, {
                blockchainCertificateId: certificate.id
            });
        } else {
            await this.offchainCertificateService.persistError(event.internalCertificateId, {
                errorMessage: `Cannot issue certificate for certificate id: ${event.internalCertificateId}`
            });
        }
    }

    async handleBatch(
        events: CertificateEventEntity[],
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
                const areCertificateIdsValid =
                    certificateIds &&
                    certificateIds.every((certificateId) =>
                        this.isCertificateIdValid(certificateId)
                    );

                if (areCertificateIdsValid) {
                    await this.offchainCertificateService.issuePersisted(
                        event.internalCertificateId,
                        {
                            blockchainCertificateId: certificateIds[index]
                        }
                    );
                } else {
                    await this.offchainCertificateService.persistError(
                        event.internalCertificateId,
                        {
                            errorMessage: `Cannot issue certificate for certificate id: ${event.internalCertificateId}`
                        }
                    );
                }
            })
        );
    }

    private isCertificateIdValid(certificateId: number): boolean {
        return !Number.isNaN(parseInt(`${certificateId}`, 10));
    }
}
