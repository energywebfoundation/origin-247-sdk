import { ONCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../../../onchain-certificate/types';
import { OnChainCertificateService } from '../../../onchain-certificate/onchain-certificate.service';
import { CertificateEventType, CertificateTransferredEvent } from '../../events/Certificate.events';
import { OffChainCertificateService } from '../../offchain-certificate.service';
import { Inject, Injectable } from '@nestjs/common';
import { chunk } from 'lodash';
import {
    BATCH_CONFIGURATION_TOKEN,
    BatchConfiguration
} from '../strategies/batch/batch.configuration';

@Injectable()
export class TransferPersistHandler {
    constructor(
        @Inject(ONCHAIN_CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: OnChainCertificateService,
        private readonly offchainCertificateService: OffChainCertificateService,
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration
    ) {}

    public async handleBatch(
        events: CertificateTransferredEvent[],
        blockchainIdMap: Record<number, number>
    ) {
        const failedCertificateIds: number[] = [];

        const eventsBlocks = chunk(events, this.batchConfiguration.transferBatchSize);

        for (const eventBlock of eventsBlocks) {
            const result = await this.synchronizeBatchBlock(eventBlock, blockchainIdMap);
            failedCertificateIds.push(...result.failedCertificateIds);
        }

        return { failedCertificateIds };
    }

    private async synchronizeBatchBlock(
        events: CertificateTransferredEvent[],
        blockchainIdMap: Record<number, number>
    ): Promise<{ failedCertificateIds: number[] }> {
        try {
            const { transactionHash } = await this.certificateService.batchTransferWithTxHash(
                events.map((event) => ({
                    ...event.payload,
                    certificateId: blockchainIdMap[event.internalCertificateId]
                }))
            );

            const promises = events.map(async (event) => {
                await this.offchainCertificateService.transferPersisted(
                    event.internalCertificateId,
                    { persistedEventId: event.id, transactionHash }
                );
            });

            await Promise.all(promises);

            return { failedCertificateIds: [] };
        } catch (e) {
            const promises = events.map(async (event) => {
                await this.offchainCertificateService.persistError(event.internalCertificateId, {
                    internalCertificateId: event.internalCertificateId,
                    type: CertificateEventType.TransferPersisted,
                    errorMessage: `${e.message}`,
                    persistedEventId: event.id
                });
                return event.internalCertificateId;
            });

            await Promise.all(promises);

            return { failedCertificateIds: events.map((e) => e.internalCertificateId) };
        }
    }
}
