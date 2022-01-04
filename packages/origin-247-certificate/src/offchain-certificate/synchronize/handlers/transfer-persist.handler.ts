import { ONCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../../../onchain-certificate/types';
import { OnChainCertificateService } from '../../../onchain-certificate/onchain-certificate.service';
import { OFFCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../../types';
import { CertificateEventRepository } from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateEventType, CertificateTransferredEvent } from '../../events/Certificate.events';
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
export class TransferPersistHandler implements SynchronizeHandler {
    constructor(
        @Inject(ONCHAIN_CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: OnChainCertificateService,
        @Inject(OFFCHAIN_CERTIFICATE_SERVICE_TOKEN)
        private readonly offchainCertificateService: OffChainCertificateService,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration
    ) {}

    public canHandle(event: CertificateEventEntity) {
        return event.type === CertificateEventType.Transferred;
    }

    public async handle(event: CertificateEventEntity) {
        const transferredEvent = event as CertificateTransferredEvent;

        const result = await this.certificateService.transfer(transferredEvent.payload);

        if (result.success) {
            await this.offchainCertificateService.transferPersisted(
                event.internalCertificateId,
                {}
            );
            return { success: true };
        } else {
            await this.offchainCertificateService.persistError(event.internalCertificateId, {
                errorMessage: `[${result.statusCode}] ${result.message}`
            });
            return { success: false };
        }
    }

    private async synchronizeBatchBlock(
        events: CertificateEventEntity[]
    ): Promise<{ failedCertificateIds: number[] }> {
        const transferredEvents = events as CertificateTransferredEvent[];
        const result = await this.certificateService.batchTransfer(
            transferredEvents.map((event) => event.payload)
        );

        const failedCertificateIds = await Promise.all(
            events.map(async (event) => {
                if (result.success) {
                    await this.offchainCertificateService.transferPersisted(
                        event.internalCertificateId,
                        {}
                    );
                } else {
                    await this.offchainCertificateService.persistError(
                        event.internalCertificateId,
                        {
                            errorMessage: `[${result.statusCode}] ${result.message}`
                        }
                    );
                    return event.internalCertificateId;
                }
            })
        );
        return { failedCertificateIds: compact(failedCertificateIds) };
    }

    async handleBatch(events: CertificateEventEntity[]) {
        const eventsBlocks = chunk(events, this.batchConfiguration.transferBatchSize);
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
