import { Inject, Injectable } from '@nestjs/common';
import { CertificateService, CERTIFICATE_SERVICE_TOKEN } from '@energyweb/origin-247-certificate';
import {
    EnergyTransferRequestRepository,
    ENERGY_TRANSFER_REQUEST_REPOSITORY
} from './repositories/EnergyTransferRequest.repository';
import { EnergyTransferRequest, State } from './EnergyTransferRequest';
import { BatchConfiguration, BATCH_CONFIGURATION_TOKEN } from './batch/configuration';
import { EventBus } from '@nestjs/cqrs';
import { AwaitingTransferEvent } from './batch/events';

@Injectable()
export class TransferService {
    constructor(
        @Inject(CERTIFICATE_SERVICE_TOKEN)
        private certificateService: CertificateService<unknown>,
        @Inject(ENERGY_TRANSFER_REQUEST_REPOSITORY)
        private etrRepository: EnergyTransferRequestRepository,
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration,
        private eventBus: EventBus
    ) {}

    public async transferTask() {
        const etrs = await this.etrRepository.findByState(State.TransferAwaiting, {
            limit: this.batchConfiguration.transferBatchSize
        });

        await this.transferCertificates(etrs);

        // Loop
        this.eventBus.publish(new AwaitingTransferEvent());
    }

    private async transferCertificates(etrs: EnergyTransferRequest[]): Promise<void> {
        etrs.forEach((etr) => etr.transferStarted());
        await this.etrRepository.saveManyInTransaction(etrs);

        try {
            await this.certificateService.batchTransfer(
                etrs.map((etr) => ({
                    fromAddress: etrs[0].sites.sellerAddress,
                    toAddress: etrs[0].sites.buyerAddress,
                    certificateId: etr.certificateId!, // verified by `transferStarted` state
                    energyValue: etr.volume
                }))
            );

            etrs.forEach((etr) => etr.transferFinished());
        } catch (e) {
            etrs.forEach((etr) => etr.transferError(e.message));
        }

        await this.etrRepository.saveManyInTransaction(etrs);
    }
}
