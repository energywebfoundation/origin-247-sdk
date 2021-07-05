import { Inject, Injectable } from '@nestjs/common';
import { CertificateService, CERTIFICATE_SERVICE_TOKEN } from '@energyweb/origin-247-certificate';
import {
    EnergyTransferBlockRepository,
    ENERGY_TRANSFER_BLOCK_REPOSITORY
} from './repositories/EnergyTransferBlock.repository';
import { GenerationReadingStoredPayload } from './events/GenerationReadingStored.event';

interface IIssueCommand extends GenerationReadingStoredPayload<unknown> {}

@Injectable()
export class TransferService {
    constructor(
        @Inject(CERTIFICATE_SERVICE_TOKEN)
        private certificateService: CertificateService<unknown>,
        @Inject(ENERGY_TRANSFER_BLOCK_REPOSITORY)
        private energyTransferBlockRepository: EnergyTransferBlockRepository
    ) {}

    public async issue(command: IIssueCommand): Promise<void> {
        const {
            deviceId,
            energyValue,
            fromTime,
            ownerBlockchainAddress,
            toTime,
            metadata
        } = command;

        const certificate = await this.certificateService.issue({
            deviceId,
            energyValue: energyValue.toString(),
            fromTime,
            toTime,
            userId: ownerBlockchainAddress,
            toAddress: ownerBlockchainAddress,
            metadata
        });

        await this.energyTransferBlockRepository.createNew({
            /** @TODO */
            buyerId: '',
            sellerId: '',
            certificateId: certificate.id,
            volume: energyValue.toString()
        });
    }
}
