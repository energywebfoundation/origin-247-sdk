import { ONCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../../../onchain-certificate/types';
import { OnChainCertificateService } from '../../../onchain-certificate/onchain-certificate.service';
import { CertificateEventType, CertificateIssuedEvent } from '../../events/Certificate.events';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { OffChainCertificateService } from '../../offchain-certificate.service';
import { Inject, Injectable } from '@nestjs/common';
import { chunk } from 'lodash';
import {
    BATCH_CONFIGURATION_TOKEN,
    BatchConfiguration
} from '../strategies/batch/batch.configuration';

@Injectable()
export class IssuePersistHandler {
    constructor(
        @Inject(ONCHAIN_CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: OnChainCertificateService<unknown>,
        private readonly offchainCertificateService: OffChainCertificateService,
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration
    ) {}

    private async synchronizeBatchBlock(
        events: CertificateIssuedEvent[]
    ): Promise<{ failedCertificateIds: number[] }> {
        try {
            const {
                certificateIds,
                transactionHash
            } = await this.certificateService.batchIssueWithTxHash(
                events
                    .map((issuedEvent) => issuedEvent.payload)
                    .map((payload) => ({
                        ...payload,
                        fromTime: new Date(payload.fromTime * 1000),
                        toTime: new Date(payload.toTime * 1000)
                    }))
            );

            const promises = events.map(async (event, index) => {
                await this.offchainCertificateService.issuePersisted(event.internalCertificateId, {
                    blockchainCertificateId: certificateIds[index],
                    persistedEventId: event.id,
                    transactionHash
                });
            });

            await Promise.all(promises);

            return { failedCertificateIds: [] };
        } catch (e) {
            const promises = events.map(async (event) => {
                await this.offchainCertificateService.persistError(event.internalCertificateId, {
                    errorMessage: `${e.error}`,
                    internalCertificateId: event.internalCertificateId,
                    type: CertificateEventType.IssuancePersisted,
                    persistedEventId: event.id
                });
            });

            await Promise.all(promises);

            return { failedCertificateIds: events.map((e) => e.internalCertificateId) };
        }
    }

    async handleBatch(events: CertificateIssuedEvent[]) {
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
}
