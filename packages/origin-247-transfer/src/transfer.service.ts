import { Inject, Injectable } from '@nestjs/common';
import { CertificateService, CERTIFICATE_SERVICE_TOKEN } from '@energyweb/origin-247-certificate';
import {
    EnergyTransferBlockRepository,
    ENERGY_TRANSFER_BLOCK_REPOSITORY
} from './repositories/EnergyTransferBlock.repository';
import { GenerationReadingStoredPayload } from './events/GenerationReadingStored.event';
import { QueryBus } from '@nestjs/cqrs';
import {
    GetTransferSitesQuery,
    IGetTransferSitesQueryResponse
} from './queries/GetTransferSites.query';

interface IIssueCommand extends GenerationReadingStoredPayload<unknown> {}

@Injectable()
export class TransferService {
    constructor(
        @Inject(CERTIFICATE_SERVICE_TOKEN)
        private certificateService: CertificateService<unknown>,
        @Inject(ENERGY_TRANSFER_BLOCK_REPOSITORY)
        private energyTransferBlockRepository: EnergyTransferBlockRepository,
        private queryBus: QueryBus
    ) {}

    public async issue(command: IIssueCommand): Promise<void> {
        const {
            generatorId,
            energyValue,
            fromTime,
            ownerBlockchainAddress,
            toTime,
            metadata
        } = command;

        const sites: IGetTransferSitesQueryResponse = await this.queryBus.execute(
            new GetTransferSitesQuery({ generatorId })
        );

        const block = await this.energyTransferBlockRepository.createNew({
            buyerId: sites.buyerId,
            sellerId: sites.sellerId,
            volume: energyValue,
            generatorId
        });

        const certificate = await this.certificateService.issue({
            deviceId: generatorId,
            energyValue: energyValue,
            fromTime,
            toTime,
            userId: ownerBlockchainAddress,
            toAddress: ownerBlockchainAddress,
            metadata
        });

        await this.energyTransferBlockRepository.updateWithCertificateId({
            blockId: block.id,
            certificateId: certificate.id
        });
    }
}
