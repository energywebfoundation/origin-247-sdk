import { ONCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../../../onchain-certificate/types';
import { OnChainCertificateService } from '../../../onchain-certificate/onchain-certificate.service';
import { CertificateEventRepository } from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateEventType, CertificateIssuedEvent } from '../../events/Certificate.events';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { OffChainCertificateService } from '../../offchain-certificate.service';
import { Inject, Injectable } from '@nestjs/common';
import { CERTIFICATE_EVENT_REPOSITORY } from '../../repositories/repository.keys';
import { chunk, compact } from 'lodash';
import { SynchronizeHandler } from './synchronize.handler';
import {
    BATCH_CONFIGURATION_TOKEN,
    BatchConfiguration
} from '../strategies/batch/batch.configuration';

@Injectable()
export class IssuePersistHandler implements SynchronizeHandler {
    constructor(
        @Inject(ONCHAIN_CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: OnChainCertificateService,
        private readonly offchainCertificateService: OffChainCertificateService,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration
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

        if (IssuePersistHandler.isCertificateIdValid(certificate?.id)) {
            await this.offchainCertificateService.issuePersisted(event.internalCertificateId, {
                blockchainCertificateId: certificate.id
            });
            return { success: true };
        } else {
            await this.offchainCertificateService.persistError(event.internalCertificateId, {
                errorMessage: `Cannot issue certificate for certificate id: ${event.internalCertificateId}`
            });
            return { success: false };
        }
    }

    async synchronizeBatchBlock(
        events: CertificateEventEntity[]
    ): Promise<{ failedCertificateIds: number[] }> {
        const issuedEvents = events as CertificateIssuedEvent<null>[];

        const certificateIds = await this.certificateService.batchIssue(
            issuedEvents
                .map((issuedEvent) => issuedEvent.payload)
                .map((payload) => ({
                    ...payload,
                    fromTime: new Date(payload.fromTime),
                    toTime: new Date(payload.toTime)
                }))
        );

        const failedCertificateIds = await Promise.all(
            events.map(async (event, index) => {
                const areCertificateIdsValid =
                    certificateIds &&
                    certificateIds.every((certificateId) =>
                        IssuePersistHandler.isCertificateIdValid(certificateId)
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
                    return event.internalCertificateId;
                }
            })
        );

        return { failedCertificateIds: compact(failedCertificateIds) };
    }

    async handleBatch(events: CertificateEventEntity[]) {
        const eventsBlocks = chunk(events, this.batchConfiguration.issueBatchSize);
        const failedCertificateIds: number[] = [];

        for (const eventsBlock of eventsBlocks) {
            const nonFailedEvents = eventsBlock.filter(
                (event) => !failedCertificateIds.includes(event.internalCertificateId)
            );

            const result = await this.synchronizeBatchBlock(nonFailedEvents);
            failedCertificateIds.push(...result.failedCertificateIds);
        }

        return { failedCertificateIds };
    }

    private static isCertificateIdValid(certificateId: number): boolean {
        return !Number.isNaN(parseInt(`${certificateId}`, 10));
    }
}
