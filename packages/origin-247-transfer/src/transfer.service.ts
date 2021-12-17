import { Inject, Injectable } from '@nestjs/common';
import {
    OFFCHAIN_CERTIFICATE_SERVICE_TOKEN,
    OffchainCertificateService
} from '@energyweb/origin-247-certificate';
import {
    ENERGY_TRANSFER_REQUEST_REPOSITORY,
    EnergyTransferRequestRepository
} from './repositories/EnergyTransferRequest.repository';
import { EnergyTransferRequest, State } from './EnergyTransferRequest';
import { chunk } from 'lodash';
import { BATCH_CONFIGURATION_TOKEN, BatchConfiguration } from './batch/configuration';

@Injectable()
export class TransferService {
    constructor(
        @Inject(OFFCHAIN_CERTIFICATE_SERVICE_TOKEN)
        private certificateService: OffchainCertificateService,
        @Inject(ENERGY_TRANSFER_REQUEST_REPOSITORY)
        private etrRepository: EnergyTransferRequestRepository,
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration
    ) {}

    public async transferTask() {
        const etrs = await this.etrRepository.findByState(State.TransferAwaiting);

        const chunkedEtrs = chunk(etrs, this.batchConfiguration.transferBatchSize);

        for (const chunk of chunkedEtrs) {
            await this.transferCertificates(chunk);
        }
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
