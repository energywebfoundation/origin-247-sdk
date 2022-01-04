import { CERTIFICATE_SERVICE_TOKEN, OFFCHAIN_CERTIFICATE_SERVICE_TOKEN } from '../../../types';
import { CertificateEventRepository } from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateClaimedEvent, CertificateEventType } from '../../events/Certificate.events';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { CertificateService } from '../../../certificate.service';
import { OffchainCertificateService } from '../../offchain-certificate.service';
import { Inject, Injectable } from '@nestjs/common';
import { CERTIFICATE_EVENT_REPOSITORY } from '../../repositories/repository.keys';
import { compact } from 'lodash';
import { SynchronizeHandler } from './synchronize.handler';

@Injectable()
export class ClaimPersistHandler implements SynchronizeHandler {
    constructor(
        @Inject(CERTIFICATE_SERVICE_TOKEN)
        private readonly certificateService: CertificateService,
        @Inject(OFFCHAIN_CERTIFICATE_SERVICE_TOKEN)
        private readonly offchainCertificateService: OffchainCertificateService,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository
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
                {}
            );
            return { success: true };
        } else {
            await this.offchainCertificateService.persistError(claimedEvent.internalCertificateId, {
                errorMessage: `[${result.statusCode}] ${result.message}`
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
        return await this.synchronizeBatchBlock(events);
    }
}
