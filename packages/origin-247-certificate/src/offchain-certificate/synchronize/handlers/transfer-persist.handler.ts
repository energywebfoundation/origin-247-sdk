import { ONCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../../../onchain-certificate/types';
import { OnChainCertificateService } from '../../../onchain-certificate/onchain-certificate.service';
import { CertificateEventType, CertificateTransferredEvent } from '../../events/Certificate.events';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { OffChainCertificateService } from '../../offchain-certificate.service';
import { Inject, Injectable } from '@nestjs/common';
import { chunk, compact } from 'lodash';
import { SynchronizeHandler } from './synchronize.handler';
import {
    BATCH_CONFIGURATION_TOKEN,
    BatchConfiguration
} from '../strategies/batch/batch.configuration';

@Injectable()
export class TransferPersistHandler implements SynchronizeHandler {
    constructor(
        @Inject(ONCHAIN_CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: OnChainCertificateService,
        private readonly offchainCertificateService: OffChainCertificateService,
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration
    ) {}

    public canHandle(event: CertificateEventEntity) {
        return event.type === CertificateEventType.Transferred;
    }

    public async handleBatch(events: CertificateEventEntity[]) {
        const eventsBlocks = chunk(events, this.batchConfiguration.transferBatchSize);
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
        const transferredEvents = events as CertificateTransferredEvent[];

        try {
            await this.certificateService.batchTransfer(
                transferredEvents.map((event) => event.payload)
            );

            const promises = events.map(async (event) => {
                await this.offchainCertificateService.transferPersisted(
                    event.internalCertificateId,
                    { persistedEventId: event.id }
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
