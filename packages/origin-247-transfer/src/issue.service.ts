import { Inject, Injectable } from '@nestjs/common';
import { OffChainCertificateService } from '@energyweb/origin-247-certificate';
import {
    EnergyTransferRequestRepository,
    ENERGY_TRANSFER_REQUEST_REPOSITORY
} from './repositories/EnergyTransferRequest.repository';
import { EventBus } from '@nestjs/cqrs';
import { EnergyTransferRequest, State } from './EnergyTransferRequest';
import { BatchConfiguration, BATCH_CONFIGURATION_TOKEN } from './batch/configuration';
import { AwaitingValidationEvent, AwaitingIssuanceEvent } from './batch/events';

@Injectable()
export class IssueService {
    constructor(
        private certificateService: OffChainCertificateService<unknown>,
        @Inject(ENERGY_TRANSFER_REQUEST_REPOSITORY)
        private etrRepository: EnergyTransferRequestRepository,
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration,
        private eventBus: EventBus
    ) {}

    public async issueTask() {
        const etrs = await this.etrRepository.findByState(State.IssuanceAwaiting, {
            limit: this.batchConfiguration.issueBatchSize
        });

        await this.issueCertificates(etrs);

        // Loop
        this.eventBus.publish(new AwaitingIssuanceEvent());
    }

    private async issueCertificates(etrs: EnergyTransferRequest[]) {
        etrs.forEach((etr) => etr.issuanceStarted());
        await this.etrRepository.saveManyInTransaction(etrs);

        try {
            const results = await this.certificateService.batchIssue(
                etrs.map((etr) => {
                    const attrs = etr.toPublicAttrs();

                    return {
                        energyValue: attrs.volume,
                        userId: attrs.sellerAddress,
                        toAddress: attrs.sellerAddress,
                        deviceId: attrs.certificateData.generatorId,
                        fromTime: new Date(attrs.certificateData.fromTime),
                        toTime: new Date(attrs.certificateData.toTime),
                        metadata: attrs.certificateData.metadata
                    };
                })
            );

            etrs.forEach((etr, index) => etr.issuanceFinished(results[index]));
            etrs.forEach((etr) => etr.persisted());

            await this.etrRepository.saveManyInTransaction(etrs);

            this.eventBus.publish(new AwaitingValidationEvent());
        } catch (e) {
            etrs.forEach((etr) => etr.issuanceError(e.message));
            await this.etrRepository.saveManyInTransaction(etrs);
        }
    }
}
