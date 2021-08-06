import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { CommandBus } from '@nestjs/cqrs';
import { BlockchainAction, BlockchainActionType } from './types';
import {
    ClaimCertificateCommand,
    IssueCertificateCommand,
    TransferCertificateCommand,
    BatchClaimCertificatesCommand,
    BatchIssueCertificatesCommand,
    BatchTransferCertificatesCommand
} from '@energyweb/issuer-api';

@Processor('blockchain-actions')
export class BlockchainActionsProcessor {
    private readonly logger = new Logger(BlockchainActionsProcessor.name);

    constructor(private readonly commandBus: CommandBus) {}

    @Process({ concurrency: 1 })
    async handle(payload: Job<BlockchainAction>): Promise<unknown> {
        const result = await this.process(payload);

        /**
         * @HOTFIX 15.06.2021
         *
         * Sometimes we get conflicting nonce/gas price problem.
         * This time --may-- fix this, but not necessarily will.
         *
         * If you, in the future, will find this, please check whether this error is still present.
         * If not, maybe this really fixed this. If yes - just remove this await.
         */
        await new Promise((resolve) =>
            setTimeout(resolve, Number(process.env.CERTIFICATE_QUEUE_DELAY ?? 10000))
        );

        return result;
    }

    async process({ data }: Job<BlockchainAction>): Promise<unknown> {
        switch (data.type) {
            case BlockchainActionType.Issuance:
                const issuanceParams = data.payload;
                this.logger.debug(`Triggering issuance for: ${JSON.stringify(issuanceParams)}`);

                return await this.commandBus.execute(
                    new IssueCertificateCommand(
                        issuanceParams.toAddress,
                        issuanceParams.energyValue,
                        issuanceParams.fromTime,
                        issuanceParams.toTime,
                        issuanceParams.deviceId,
                        issuanceParams.userId,
                        false,
                        JSON.stringify(issuanceParams.metadata)
                    )
                );

            case BlockchainActionType.Transfer:
                const transferParams = data.payload;
                this.logger.debug(`Triggering transfer for: ${JSON.stringify(transferParams)}`);

                return await this.commandBus.execute(
                    new TransferCertificateCommand(
                        transferParams.certificateId,
                        transferParams.fromAddress,
                        transferParams.toAddress,
                        transferParams.energyValue ? transferParams.energyValue : undefined
                    )
                );

            case BlockchainActionType.Claim:
                const claimParams = data.payload;
                this.logger.debug(`Triggering claim for: ${JSON.stringify(claimParams)}`);

                return await this.commandBus.execute(
                    new ClaimCertificateCommand(
                        claimParams.certificateId,
                        claimParams.claimData,
                        claimParams.forAddress,
                        claimParams.energyValue ? claimParams.energyValue.toString() : undefined
                    )
                );

            case BlockchainActionType.BatchIssuance:
                const batchIssuanceParams = data.payload;
                this.logger.debug(
                    `Triggering batch issuance for: ${JSON.stringify(batchIssuanceParams)}`
                );

                return await this.commandBus.execute(
                    new BatchIssueCertificatesCommand(
                        batchIssuanceParams.certificates.map((certificate) => ({
                            to: certificate.toAddress,
                            deviceId: certificate.deviceId,
                            energy: certificate.energyValue,
                            fromTime: certificate.fromTime,
                            toTime: certificate.toTime,
                            metadata: JSON.stringify(certificate.metadata)
                        }))
                    )
                );

            case BlockchainActionType.BatchTransfer:
                const batchTransferParams = data.payload;
                this.logger.debug(
                    `Triggering batch transfer for: ${JSON.stringify(batchTransferParams)}`
                );

                return await this.commandBus.execute(
                    new BatchTransferCertificatesCommand(
                        batchTransferParams.certificates.map((c) => ({
                            id: c.certificateId,
                            amount: c.energyValue
                        })),
                        batchTransferParams.toAddress,
                        batchTransferParams.fromAddress
                    )
                );

            case BlockchainActionType.BatchClaim:
                const batchClaimParams = data.payload;
                this.logger.debug(
                    `Triggering batch claim for: ${JSON.stringify(batchClaimParams)}`
                );

                return await this.commandBus.execute(
                    new BatchClaimCertificatesCommand(
                        batchClaimParams.certificates.map((c) => ({
                            id: c.certificateId,
                            amount: c.energyValue
                        })),
                        batchClaimParams.claimData,
                        batchClaimParams.forAddress
                    )
                );
        }
    }
}
