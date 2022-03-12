import { CertificateBatchOperations, CertificateSchemaVersion } from '@energyweb/issuer';
import { BigNumber, ContractTransaction } from 'ethers';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IBatchTransferCommand } from '../../../types';
import { BlockchainPropertiesService } from '../../blockchain-properties.service';

@Injectable()
export class BatchTransferCertificatesHandler<T = null> {
    constructor(private readonly blockchainPropertiesService: BlockchainPropertiesService) {}

    async execute({ transfers }: IBatchTransferCommand): Promise<ContractTransaction> {
        const blockchainProperties = await this.blockchainPropertiesService.getProperties();

        try {
            return await CertificateBatchOperations.transferCertificates(
                transfers.map((transfer) => ({
                    schemaVersion: CertificateSchemaVersion.Latest,
                    amount: BigNumber.from(transfer.energyValue),
                    id: transfer.certificateId,
                    from: transfer.fromAddress,
                    to: transfer.toAddress
                })),
                blockchainProperties
            );
        } catch (error) {
            throw new HttpException(JSON.stringify(error), HttpStatus.FAILED_DEPENDENCY);
        }
    }
}
