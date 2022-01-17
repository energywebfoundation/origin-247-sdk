import {
    GetAllCertificatesQuery,
    GetCertificateQuery,
    IGetAllCertificatesOptions
} from '@energyweb/issuer-api';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bull';
import { IClaim } from '@energyweb/issuer';
import { Job, Queue } from 'bull';
import { BlockchainAction, BlockchainActionType, ICertificate } from './types';
import {
    IClaimCommand,
    IIssueCommand,
    IIssueCommandParams,
    IIssuedCertificate,
    ITransferCommand
} from '../types';
import {
    BatchClaimActionResult,
    BatchIssuanceActionResult,
    BatchTransferActionResult,
    blockchainQueueName,
    ClaimActionResult,
    IssuanceActionResult,
    TransferActionResult
} from './blockchain-actions.processor';

const jobOptions = {
    // redis cleanup
    removeOnComplete: true,
    removeOnFail: true
};

@Injectable()
export class OnChainCertificateService<T = null> {
    constructor(
        private readonly queryBus: QueryBus,
        @InjectQueue(blockchainQueueName)
        private readonly blockchainActionsQueue: Queue<BlockchainAction>
    ) {}

    public async getAll(options: IGetAllCertificatesOptions = {}): Promise<ICertificate<T>[]> {
        const certificates = await this.queryBus.execute(new GetAllCertificatesQuery(options));

        return certificates.map((c) => this.mapCertificate(c));
    }

    public async getById(id: number): Promise<ICertificate<T> | null> {
        const certificate = await this.queryBus.execute(new GetCertificateQuery(id));

        return certificate ? this.mapCertificate(certificate) : null;
    }

    public async issueWithTxHash(params: IIssueCommandParams<T>): Promise<IssuanceActionResult<T>> {
        const command = {
            ...params,
            fromTime: Math.round(params.fromTime.getTime() / 1000),
            toTime: Math.round(params.toTime.getTime() / 1000)
        } as IIssueCommand<T>;

        const job = await this.blockchainActionsQueue.add(
            {
                payload: command,
                type: BlockchainActionType.Issuance
            },
            jobOptions
        );

        return await OnChainCertificateService.waitForJobResult<IssuanceActionResult<T>>(job);
    }

    public async issue(params: IIssueCommandParams<T>): Promise<IIssuedCertificate<T>> {
        const { certificate } = await this.issueWithTxHash(params);

        return this.mapCertificate(certificate);
    }

    public async claimWithTxHash(command: IClaimCommand): Promise<ClaimActionResult> {
        const job = await this.blockchainActionsQueue.add(
            {
                payload: command,
                type: BlockchainActionType.Claim
            },
            jobOptions
        );

        return await OnChainCertificateService.waitForJobResult(job);
    }

    public async claim(command: IClaimCommand): Promise<void> {
        await this.claimWithTxHash(command);
    }

    public async transferWithTxHash(command: ITransferCommand): Promise<TransferActionResult> {
        const job = await this.blockchainActionsQueue.add(
            {
                payload: command,
                type: BlockchainActionType.Transfer
            },
            jobOptions
        );

        return await OnChainCertificateService.waitForJobResult(job);
    }

    public async transfer(command: ITransferCommand): Promise<void> {
        await this.transferWithTxHash(command);
    }

    public async batchIssueWithTxHash(
        originalCertificates: IIssueCommandParams<T>[]
    ): Promise<BatchIssuanceActionResult> {
        const certificates = originalCertificates.map(
            (certificate) =>
                ({
                    ...certificate,
                    fromTime: Math.round(certificate.fromTime.getTime() / 1000),
                    toTime: Math.round(certificate.toTime.getTime() / 1000)
                } as IIssueCommand<T>)
        );

        const job = await this.blockchainActionsQueue.add(
            {
                payload: {
                    certificates
                },
                type: BlockchainActionType.BatchIssuance
            },
            jobOptions
        );

        return await OnChainCertificateService.waitForJobResult(job);
    }

    public async batchIssue(originalCertificates: IIssueCommandParams<T>[]): Promise<number[]> {
        if (originalCertificates.length === 0) {
            return [];
        }

        const { certificateIds } = await this.batchIssueWithTxHash(originalCertificates);

        return certificateIds;
    }

    public async batchClaimWithTxHash(command: IClaimCommand[]): Promise<BatchClaimActionResult> {
        const job = await this.blockchainActionsQueue.add(
            {
                payload: {
                    claims: command
                },
                type: BlockchainActionType.BatchClaim
            },
            jobOptions
        );

        return await OnChainCertificateService.waitForJobResult(job);
    }

    public async batchClaim(command: IClaimCommand[]): Promise<void> {
        if (command.length === 0) {
            return;
        }

        await this.batchClaimWithTxHash(command);
    }

    public async batchTransferWithTxHash(
        command: ITransferCommand[]
    ): Promise<BatchTransferActionResult> {
        const job = await this.blockchainActionsQueue.add(
            {
                payload: {
                    transfers: command
                },
                type: BlockchainActionType.BatchTransfer
            },
            jobOptions
        );

        return await OnChainCertificateService.waitForJobResult(job);
    }

    public async batchTransfer(command: ITransferCommand[]): Promise<void> {
        if (command.length === 0) {
            return;
        }

        await this.batchTransferWithTxHash(command);
    }

    private mapCertificate<P extends { metadata: any; claims: IClaim[] }>(
        certificate: P
    ): P & { metadata: T; claims: IClaim[] } {
        return {
            ...certificate,
            /** @NOTE this may be null, but this will be fixed at some point */
            claims: certificate.claims ?? [],
            metadata: certificate.metadata !== '' ? JSON.parse(certificate.metadata) : null
        };
    }

    private static async waitForJobResult<ActionResult>(
        job: Job<BlockchainAction>
    ): Promise<ActionResult> {
        try {
            return await job.finished();
        } catch (e) {
            const error = new Error(e.message);
            error.stack =
                '[Hidden job error stack trace]. Please refer to logger logs for error stacktrace';

            throw error;
        }
    }
}
