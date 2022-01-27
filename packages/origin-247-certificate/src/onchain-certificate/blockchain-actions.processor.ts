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
import { ICertificate } from './types';
import {
    IBatchClaimCommand,
    IBatchIssueCommand,
    IBatchTransferCommand,
    IClaimCommand,
    IIssueCommand,
    ITransferCommand
} from '../types';

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
                return await this.handleIssue(data.payload);
            case BlockchainActionType.Transfer:
                return await this.handleTransfer(data.payload);
            case BlockchainActionType.Claim:
                return await this.handleClaim(data.payload);
            case BlockchainActionType.BatchIssuance:
                return await this.handleBatchIssue(data.payload);
            case BlockchainActionType.BatchTransfer:
                return await this.handleBatchTransfer(data.payload);
            case BlockchainActionType.BatchClaim:
                return await this.handleBatchClaim(data.payload);
        }
    }

    private async handleIssue(params: IIssueCommand<any>): Promise<IssuanceActionResult<any>> {
        this.logger.debug(`Triggering issuance for: ${JSON.stringify(params)}`);

        const issuanceTx = await this.commandBus.execute(
            new IssueCertificateCommand(
                params.toAddress,
                params.energyValue,
                params.fromTime,
                params.toTime,
                params.deviceId,
                params.userId,
                false,
                JSON.stringify(params.metadata)
            )
        );

        const issuanceCertificates = await this.transactionPoll.waitForNewCertificates(
            issuanceTx.hash
        );

        return {
            certificate: (issuanceCertificates[0] as unknown) as ICertificate,
            transactionHash: issuanceTx.hash
        };
    }

    private async handleTransfer(params: ITransferCommand): Promise<TransferActionResult> {
        this.logger.debug(`Triggering transfer for: ${JSON.stringify(params)}`);

        const transferTx = await this.commandBus.execute(
            new TransferCertificateCommand(
                params.certificateId,
                params.fromAddress,
                params.toAddress,
                params.energyValue ? params.energyValue : undefined
            )
        );

        await this.transactionPoll.waitForTransaction(transferTx.hash);

        return { transactionHash: transferTx.hash };
    }

    private async handleClaim(params: IClaimCommand): Promise<ClaimActionResult> {
        this.logger.debug(`Triggering claim for: ${JSON.stringify(params)}`);

        const claimTx = await this.commandBus.execute(
            new ClaimCertificateCommand(
                params.certificateId,
                params.claimData,
                params.forAddress,
                params.energyValue ? params.energyValue.toString() : undefined
            )
        );

        await this.transactionPoll.waitForTransaction(claimTx.hash);

        return { transactionHash: claimTx.hash };
    }

    private async handleBatchIssue(
        params: IBatchIssueCommand<any>
    ): Promise<BatchIssuanceActionResult> {
        this.logger.debug(`Triggering batch issuance for: ${JSON.stringify(params)}`);

        const batchIssuanceTx = await this.commandBus.execute(
            new BatchIssueCertificatesCommand(
                params.certificates.map((certificate) => ({
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
    }

    private async handleBatchTransfer(
        params: IBatchTransferCommand
    ): Promise<BatchTransferActionResult> {
        this.logger.debug(`Triggering batch transfer for: ${JSON.stringify(params)}`);

        const batchTransferTx = await this.commandBus.execute(
            new BatchTransferCertificatesCommand(
                params.transfers.map((t) => ({
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
    }

    private async handleBatchClaim(params: IBatchClaimCommand): Promise<BatchClaimActionResult> {
        this.logger.debug(`Triggering batch claim for: ${JSON.stringify(params)}`);

        const batchClaimTx = await this.commandBus.execute(
            new BatchClaimCertificatesCommand(
                params.claims.map((c) => ({
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

type TransactionHashResult = {
    transactionHash: string;
};

export type BatchIssuanceActionResult = { certificateIds: number[] } & TransactionHashResult;

export type BatchTransferActionResult = TransactionHashResult;

export type BatchClaimActionResult = TransactionHashResult;

export type IssuanceActionResult<MetadataType> = {
    certificate: ICertificate<MetadataType>;
} & TransactionHashResult;

export type TransferActionResult = TransactionHashResult;

export type ClaimActionResult = TransactionHashResult;
