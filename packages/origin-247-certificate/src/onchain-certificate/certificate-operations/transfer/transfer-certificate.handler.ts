import { Certificate as CertificateFacade, CertificateSchemaVersion } from '@energyweb/issuer';
import { BigNumber, ContractTransaction } from 'ethers';
import { Injectable } from '@nestjs/common';
import { BlockchainPropertiesService } from '../../blockchain-properties.service';
import { ITransferCommand } from '../../../types';

@Injectable()
export class TransferCertificateHandler<T = null> {
    constructor(private readonly blockchainPropertiesService: BlockchainPropertiesService) {}

    async execute({
        certificateId,
        fromAddress,
        toAddress,
        energyValue
    }: ITransferCommand): Promise<ContractTransaction> {
        const blockchainProperties = await this.blockchainPropertiesService.getProperties();

        const onChainCert = await new CertificateFacade(
            certificateId,
            blockchainProperties,
            CertificateSchemaVersion.Latest
        );

        return await onChainCert.transfer(
            toAddress,
            BigNumber.from(energyValue ?? onChainCert.owners[fromAddress]),
            fromAddress
        );
    }
}
