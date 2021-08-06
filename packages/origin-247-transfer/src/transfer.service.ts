import { Inject, Injectable } from '@nestjs/common';
import { CertificateService, CERTIFICATE_SERVICE_TOKEN } from '@energyweb/origin-247-certificate';
import {
    EnergyTransferRequestRepository,
    ENERGY_TRANSFER_REQUEST_REPOSITORY
} from './repositories/EnergyTransferRequest.repository';
import { EnergyTransferRequest, State } from './EnergyTransferRequest';
import { groupBy, values, chunk } from 'lodash';
import { BatchConfiguration, BATCH_CONFIGURATION_TOKEN } from './batch/configuration';

@Injectable()
export class TransferService {
    constructor(
        @Inject(CERTIFICATE_SERVICE_TOKEN)
        private certificateService: CertificateService<unknown>,
        @Inject(ENERGY_TRANSFER_REQUEST_REPOSITORY)
        private etrRepository: EnergyTransferRequestRepository,
        @Inject(BATCH_CONFIGURATION_TOKEN)
        private batchConfiguration: BatchConfiguration
    ) {}

    public async transferTask() {
        const etrs = await this.etrRepository.findByState(State.TransferAwaiting);

        const groupedEtrs = values(
            groupBy(etrs, (e) => `${e.sites.sellerAddress}${e.sites.buyerAddress}`)
        );

        for (const etrGroup of groupedEtrs) {
            const chunkedEtrs = chunk(etrGroup, this.batchConfiguration.transferBatchSize);

            for (const chunk of chunkedEtrs) {
                await this.transferCertificates(chunk);
            }
        }
    }

    private async transferCertificates(etrs: EnergyTransferRequest[]): Promise<void> {
        etrs.forEach((etr) => etr.transferStarted());
        await this.etrRepository.saveManyInTransaction(etrs);

        try {
            const result = await this.certificateService.batchTransfer({
                fromAddress: etrs[0].sites.sellerAddress,
                toAddress: etrs[0].sites.buyerAddress,
                certificates: etrs.map((etr) => ({
                    certificateId: etr.certificateId!, // verified by `transferStarted` state
                    energyValue: etr.volume
                }))
            });

            if (!result.success) {
                throw new Error(result.message ?? 'Unknown transfer error');
            }

            etrs.forEach((etr) => etr.transferFinished());
        } catch (e) {
            etrs.forEach((etr) => etr.transferError(e.message));
        }

        await this.etrRepository.saveManyInTransaction(etrs);
    }
}
