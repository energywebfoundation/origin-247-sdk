import { ONCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../../../onchain-certificate/types';
import { OnChainCertificateService } from '../../../onchain-certificate/onchain-certificate.service';
import { CertificateClaimedEvent, CertificateEventType } from '../../events/Certificate.events';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { OffChainCertificateService } from '../../offchain-certificate.service';
import { Inject, Injectable } from '@nestjs/common';
import { compact } from 'lodash';
import { SynchronizeHandler } from './synchronize.handler';

@Injectable()
export class ClaimPersistHandler implements SynchronizeHandler {
    constructor(
        @Inject(ONCHAIN_CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: OnChainCertificateService,
        private readonly offchainCertificateService: OffChainCertificateService
    ) {}

    public canHandle(event: CertificateEventEntity) {
        return event.type === CertificateEventType.Claimed;
    }

    public async handle(event: CertificateEventEntity) {
        const claimedEvent = event as CertificateClaimedEvent;

        const result = await this.certificateService.claim(claimedEvent.payload);

        if (result.success) {
            await this.offchainCertificateService.claimPersisted(
                claimedEvent.internalCertificateId,
                { persistedEventId: event.id }
            );
            return { success: true };
        } else {
            await this.offchainCertificateService.persistError(claimedEvent.internalCertificateId, {
                errorMessage: `[${result.statusCode}] ${result.message}`,
                internalCertificateId: event.internalCertificateId,
                type: CertificateEventType.ClaimPersisted
            });
            return { success: false };
        }
    }

    private async synchronizeBatchBlock(
        events: CertificateEventEntity[]
    ): Promise<{ failedCertificateIds: number[] }> {
        const claimedEvents = events as CertificateClaimedEvent[];
        const result = await this.certificateService.batchClaim(
            claimedEvents.map((event) => event.payload)
        );

        const failedCertificateIds = await Promise.all(
            events.map(async (event) => {
                if (result.success) {
                    await this.offchainCertificateService.claimPersisted(
                        event.internalCertificateId,
                        { persistedEventId: event.id }
                    );
                } else {
                    await this.offchainCertificateService.persistError(
                        event.internalCertificateId,
                        {
                            errorMessage: `[${result.statusCode}] ${result.message}`,
                            internalCertificateId: event.internalCertificateId,
                            type: CertificateEventType.ClaimPersisted
                        }
                    );

                    return event.internalCertificateId;
                }
            })
        );

        return { failedCertificateIds: compact(failedCertificateIds) };
    }

    async handleBatch(events: CertificateEventEntity[]) {
        return await this.synchronizeBatchBlock(events);
    }
}
