import { Certificate as CertificateFacade, CertificateSchemaVersion } from '@energyweb/issuer';
import { BigNumber, ContractTransaction } from 'ethers';
import { Injectable } from '@nestjs/common';
import { BlockchainPropertiesService } from '../../blockchain-properties.service';
import { IClaimCommand } from '../../../types';

@Injectable()
export class ClaimCertificateHandler<T = null> {
    constructor(private readonly blockchainPropertiesService: BlockchainPropertiesService) {}

    async execute({
        certificateId,
        claimData,
        forAddress,
        energyValue
    }: IClaimCommand): Promise<ContractTransaction> {
        const blockchainProperties = await this.blockchainPropertiesService.getProperties();

        const cert = await new CertificateFacade(
            certificateId,
            blockchainProperties,
            CertificateSchemaVersion.Latest
        );

        return await cert.claim(claimData, BigNumber.from(energyValue), forAddress, forAddress);
    }
}
