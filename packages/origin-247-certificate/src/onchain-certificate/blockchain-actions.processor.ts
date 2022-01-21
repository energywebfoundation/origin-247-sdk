import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { CommandBus } from '@nestjs/cqrs';
import { BlockchainAction, BlockchainActionType } from './types';
import { BigNumber } from 'ethers';
import {
    BatchClaimCertificatesCommand,
    BatchIssueCertificatesCommand,
    BatchTransferCertificatesCommand,
    ClaimCertificateCommand,
    IssueCertificateCommand,
    TransferCertificateCommand
} from '@energyweb/issuer-api';
import { TransactionPollService } from './transaction-poll.service';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '../offchain-certificate/config/config.interface';
import { IIssuedCertificate } from '../types';

export const blockchainQueueName = 'blockchain-actions';

@Processor(blockchainQueueName)
export class BlockchainActionsProcessor {
    private readonly logger = new Logger(BlockchainActionsProcessor.name);

    constructor(
        private commandBus: CommandBus,
        private transactionPoll: TransactionPollService,
        private readonly configService: ConfigService<Configuration>
    ) {}

    @Process({ concurrency: 1 })
    async handle(payload: Job<BlockchainAction>): Promise<unknown> {
        try {
            const result = await this.process(payload);

            /**
             * Sometimes we get conflicting nonce/gas price problem.
             * Therefore we need to give some time to process everything.
             */
            await new Promise((resolve) =>
                setTimeout(resolve, this.configService.get('CERTIFICATE_QUEUE_DELAY'))
            );

            return result;
        } catch (e) {
            this.logger.error(
                `Error on job ${JSON.stringify(payload.data)}: ${e.message}`,
                e.stack
            );

            throw e;
        }
    }

    async process({
        data
    }: Job<BlockchainAction>): Promise<
        | BatchIssuanceActionResult
        | BatchTransferActionResult
        | BatchClaimActionResult
        | IssuanceActionResult<any>
        | TransferActionResult
        | ClaimActionResult
    > {
        switch (data.type) {
            case BlockchainActionType.Issuance:
                const issuanceParams = data.payload;
                this.logger.debug(`Triggering issuance for: ${JSON.stringify(issuanceParams)}`);

                const issuanceTx = await this.commandBus.execute(
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

                const issuanceCertificates = await this.transactionPoll.waitForNewCertificates(
                    issuanceTx.hash
                );

                return {
                    certificate: (issuanceCertificates[0] as unknown) as IIssuedCertificate,
                    transactionHash: issuanceTx.hash
                };

            case BlockchainActionType.Transfer:
                const transferParams = data.payload;
                this.logger.debug(`Triggering transfer for: ${JSON.stringify(transferParams)}`);

                const transferTx = await this.commandBus.execute(
                    new TransferCertificateCommand(
                        transferParams.certificateId,
                        transferParams.fromAddress,
                        transferParams.toAddress,
                        transferParams.energyValue ? transferParams.energyValue : undefined
                    )
                );

                await this.transactionPoll.waitForTransaction(transferTx.hash);

                return { transactionHash: transferTx.hash };

            case BlockchainActionType.Claim:
                const claimParams = data.payload;
                this.logger.debug(`Triggering claim for: ${JSON.stringify(claimParams)}`);

                const claimTx = await this.commandBus.execute(
                    new ClaimCertificateCommand(
                        claimParams.certificateId,
                        claimParams.claimData,
                        claimParams.forAddress,
                        claimParams.energyValue ? claimParams.energyValue.toString() : undefined
                    )
                );

                await this.transactionPoll.waitForTransaction(claimTx.hash);

                return { transactionHash: claimTx.hash };

            case BlockchainActionType.BatchIssuance:
                const batchIssuanceParams = data.payload;
                this.logger.debug(
                    `Triggering batch issuance for: ${JSON.stringify(batchIssuanceParams)}`
                );

                const batchIssuanceTx = await this.commandBus.execute(
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

                const batchIssuanceCertificates = await this.transactionPoll.waitForNewCertificates(
                    batchIssuanceTx.hash
                );

                return {
                    certificateIds: batchIssuanceCertificates.map((c) => c.id),
                    transactionHash: batchIssuanceTx.hash
                };

            case BlockchainActionType.BatchTransfer:
                const batchTransferParams = data.payload;
                this.logger.debug(
                    `Triggering batch transfer for: ${JSON.stringify(batchTransferParams)}`
                );

                const batchTransferTx = await this.commandBus.execute(
                    new BatchTransferCertificatesCommand(
                        batchTransferParams.transfers.map((t) => ({
                            id: t.certificateId,
                            to: t.toAddress,
                            from: t.fromAddress,
                            amount: t.energyValue ? BigNumber.from(t.energyValue) : undefined
                        }))
                    )
                );

                await this.transactionPoll.waitForTransaction(batchTransferTx.hash);

                return {
                    transactionHash: batchTransferTx.hash
                };

            case BlockchainActionType.BatchClaim:
                const batchClaimParams = data.payload;
                this.logger.debug(
                    `Triggering batch claim for: ${JSON.stringify(batchClaimParams)}`
                );

                const batchClaimTx = await this.commandBus.execute(
                    new BatchClaimCertificatesCommand(
                        batchClaimParams.claims.map((c) => ({
                            id: c.certificateId,
                            from: c.forAddress,
                            amount: c.energyValue ? BigNumber.from(c.energyValue) : undefined,
                            claimData: c.claimData
                        }))
                    )
                );

                await this.transactionPoll.waitForTransaction(batchClaimTx.hash);

                return {
                    transactionHash: batchClaimTx.hash
                };
        }
    }
}

type TransactionHashResult = {
    transactionHash: string;
};

export type BatchIssuanceActionResult = { certificateIds: number[] } & TransactionHashResult;

export type BatchTransferActionResult = TransactionHashResult;

export type BatchClaimActionResult = TransactionHashResult;

export type IssuanceActionResult<MetadataType> = {
    certificate: IIssuedCertificate<MetadataType>;
} & TransactionHashResult;

export type TransferActionResult = TransactionHashResult;

export type ClaimActionResult = TransactionHashResult;
