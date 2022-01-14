import { ONCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../../../onchain-certificate/types';
import { OnChainCertificateService } from '../../../onchain-certificate/onchain-certificate.service';
import { CertificateClaimedEvent, CertificateEventType } from '../../events/Certificate.events';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { OffChainCertificateService } from '../../offchain-certificate.service';
import { Inject, Injectable } from '@nestjs/common';
import { chunk } from 'lodash';
import { SynchronizeHandler } from './synchronize.handler';
import {
    BatchConfiguration,
    BATCH_CONFIGURATION_TOKEN
} from '../strategies/batch/batch.configuration';

@Injectable()
export class ClaimPersistHandler implements SynchronizeHandler {
    constructor(
        @Inject(ONCHAIN_CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: OnChainCertificateService,
        private readonly offchainCertificateService: OffChainCertificateService,
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration
    ) {}

    public canHandle(event: CertificateEventEntity) {
        return event.type === CertificateEventType.Claimed;
    }

    public async handleBatch(events: CertificateEventEntity[]) {
        const eventsBlocks = chunk(events, this.batchConfiguration.claimBatchSize);
        const failedCertificateIds: number[] = [];

        for (const eventsBlock of eventsBlocks) {
            const result = await this.synchronizeBatchBlock(eventsBlock);
            failedCertificateIds.push(...result.failedCertificateIds);
        }

        return { failedCertificateIds };
    }

    private async synchronizeBatchBlock(
        events: CertificateEventEntity[]
    ): Promise<{ failedCertificateIds: number[] }> {
        const claimedEvents = events as CertificateClaimedEvent[];

        try {
            const { transactionHash } = await this.certificateService.batchClaimWithTxHash(
                claimedEvents.map((event) => event.payload)
            );

            const promises = events.map(async (event) => {
                await this.offchainCertificateService.claimPersisted(event.internalCertificateId, {
                    persistedEventId: event.id,
                    transactionHash
                });
            });

            await Promise.all(promises);

            return { failedCertificateIds: [] };
        } catch (e) {
            const promises = events.map(async (event) => {
                await this.offchainCertificateService.persistError(event.internalCertificateId, {
                    errorMessage: `${e.message}`,
                    internalCertificateId: event.internalCertificateId,
                    type: CertificateEventType.ClaimPersisted,
                    persistedEventId: event.id
                });

                return event.internalCertificateId;
            });

            await Promise.all(promises);

            return { failedCertificateIds: events.map((e) => e.internalCertificateId) };
        }
    }
}
