import { CertificateService } from './certificate.service';
import { EventBus } from '@nestjs/cqrs';
import { BigNumber } from 'ethers';
import {
    ICertificate,
    IClaimCommand,
    ITransferCommand,
    ISuccessResponse,
    IIssuedCertificate,
    IIssueCommandParams,
    IBatchClaimCommand,
    IBatchTransferCommand
} from './types';
import { Injectable } from '@nestjs/common';
import { CertificatePersistedEvent } from './externals';

type PublicPart<T> = { [K in keyof T]: T[K] };

@Injectable()
export class CertificateForUnitTestsService<T> implements PublicPart<CertificateService<T>> {
    private serial = 0;
    private db: ICertificate<T>[] = [];

    constructor(private readonly eventBus: EventBus) {}

    public async getAll(): Promise<ICertificate<T>[]> {
        return [...this.db];
    }

    public async getById(id: number): Promise<ICertificate<T> | null> {
        return this.db.find((c) => c.id === id) ?? null;
    }

    public async issue(params: IIssueCommandParams<T>): Promise<IIssuedCertificate<T>> {
        this.serial += 1;

        const certificate: ICertificate<T> = {
            claims: [],
            claimers: {},
            creationBlockHash: '',
            creationTime: Math.floor(Date.now() / 1000),
            deviceId: params.deviceId,
            generationStartTime: Math.floor(params.fromTime.getTime() / 1000),
            generationEndTime: Math.floor(params.toTime.getTime() / 1000),
            id: this.serial,
            issuedPrivately: false,
            metadata: params.metadata,
            owners: {
                [params.toAddress]: params.energyValue
            }
        };

        setTimeout(() => {
            this.db.push(certificate);
            this.eventBus.publish(new CertificatePersistedEvent(certificate.id));
        }, 2000);

        return {
            ...certificate,
            issuedPrivately: false,
            isClaimed: false,
            isOwned: true,
            myClaims: [],
            energy: {
                claimedVolume: '0',
                privateVolume: '0',
                publicVolume: params.energyValue
            }
        };
    }

    public async claim(command: IClaimCommand): Promise<ISuccessResponse> {
        const certificate = this.db.find((c) => c.id === command.certificateId);

        if (!certificate) {
            return {
                success: false,
                message: `No certificate of ${command.certificateId} found`
            };
        }

        certificate.claims.push({
            claimData: command.claimData,
            value:
                command.energyValue ??
                Object.values(certificate.owners)
                    .reduce((sum, v) => sum.add(v), BigNumber.from(0))
                    .toString(),
            topic: '0',
            from: '',
            id: 0,
            to: ''
        });

        return {
            success: true
        };
    }

    public async transfer(command: ITransferCommand): Promise<ISuccessResponse> {
        const certificate = this.db.find((c) => c.id === command.certificateId);

        if (!certificate) {
            return {
                success: false,
                message: `No certificate of ${command.certificateId} found`
            };
        }

        const value = Number(command.energyValue ?? certificate.owners[command.fromAddress]);

        certificate.owners[command.fromAddress] = (
            Number(certificate.owners[command.fromAddress]) - value
        ).toString();
        certificate.owners[command.toAddress] = (
            Number(certificate.owners[command.toAddress] ?? 0) + value
        ).toString();

        return {
            success: true
        };
    }

    public async batchIssue(originalCertificates: IIssueCommandParams<T>[]): Promise<number[]> {
        if (originalCertificates.length === 0) {
            return [];
        }

        const result = await Promise.all(
            originalCertificates.map((certificate) => this.issue(certificate))
        );

        return result.map((r) => r.id);
    }

    public async batchClaim(command: IClaimCommand[]): Promise<ISuccessResponse> {
        if (command.length === 0) {
            return {
                success: true
            };
        }

        const result = await Promise.all(command.map((claim) => this.claim(claim)));

        return {
            success: result.every((r) => r.success)
        };
    }

    public async batchTransfer(command: ITransferCommand[]): Promise<ISuccessResponse> {
        if (command.length === 0) {
            return {
                success: true
            };
        }

        const result = await Promise.all(command.map((transfer) => this.transfer(transfer)));

        return {
            success: result.every((r) => r.success)
        };
    }
}
