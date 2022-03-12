import { Certificate as CertificateFacade } from '@energyweb/issuer';
import { BigNumber, ContractTransaction } from 'ethers';
import { IIssueCommand } from '../../../types';
import { BlockchainPropertiesService } from '../../blockchain-properties.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IssueCertificateHandler {
    constructor(private readonly blockchainPropertiesService: BlockchainPropertiesService) {}

    async execute({
        toAddress,
        energyValue,
        fromTime,
        toTime,
        deviceId,
        metadata
    }: IIssueCommand<any>): Promise<ContractTransaction> {
        const blockchainProperties = await this.blockchainPropertiesService.getProperties();

        return await CertificateFacade.create(
            toAddress,
            BigNumber.from(energyValue),
            fromTime,
            toTime,
            deviceId,
            blockchainProperties,
            metadata
        );
    }
}
