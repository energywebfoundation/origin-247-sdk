import { OnChainCertificateService } from './onchain-certificate.service';
import { IGetAllCertificatesOptions } from '@energyweb/issuer-api';
import { BigNumber } from 'ethers';
import { ICertificate } from './types';
import { IClaimCommand, IIssueCommandParams, IIssuedCertificate, ITransferCommand } from '../types';
import { Injectable } from '@nestjs/common';

type PublicPart<T> = { [K in keyof T]: T[K] };
@Injectable()
export class CertificateForUnitTestsService<T> implements PublicPart<OnChainCertificateService<T>> {
    protected serial = 0;
    private db: ICertificate<T>[] = [];

    public async getAll(options: IGetAllCertificatesOptions = {}): Promise<ICertificate<T>[]> {
        const lastDate = new Date('2030-01-01T00:00:00.000Z');
        const generationEndFrom = options.generationEndFrom ?? new Date(0);
        const generationEndTo = options.generationEndTo ?? lastDate;
        const generationStartFrom = options.generationStartFrom ?? new Date(0);
        const generationStartTo = options.generationStartTo ?? lastDate;
        const creationTimeFrom = options.creationTimeFrom ?? new Date(0);
        const creationTimeTo = options.creationTimeTo ?? lastDate;
        const deviceId = options.deviceId;

        return this.db.filter((entry) => {
            const isDateOk =
                new Date(entry.generationStartTime * 1000) >= generationStartFrom &&
                new Date(entry.generationStartTime * 1000) <= generationStartTo &&
                new Date(entry.generationEndTime * 1000) >= generationEndFrom &&
                new Date(entry.generationEndTime * 1000) <= generationEndTo &&
                new Date(entry.creationTime * 1000) >= creationTimeFrom &&
                new Date(entry.creationTime * 1000) <= creationTimeTo;

            const isDeviceOk = deviceId ? deviceId === entry.deviceId : true;

            return isDateOk && isDeviceOk;
        });
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

        this.db.push(certificate);

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

    public async claim(command: IClaimCommand): Promise<void> {
        const certificate = this.db.find((c) => c.id === command.certificateId);

        if (!certificate) {
            return;
        }

        const value =
            command.energyValue ??
            Object.values(certificate.owners)
                .reduce((sum, v) => sum.add(v), BigNumber.from(0))
                .toString();

        certificate.claims.push({
            claimData: command.claimData,
            value,
            topic: '0',
            from: command.forAddress,
            id: 0,
            to: command.forAddress
        });
        const ownedValue = certificate.owners[command.forAddress];

        certificate.owners[command.forAddress] = BigNumber.from(ownedValue)
            .sub(BigNumber.from(value))
            .toString();

        certificate.claimers![command.forAddress] = value;
    }

    public async transfer(command: ITransferCommand): Promise<void> {
        const certificate = this.db.find((c) => c.id === command.certificateId);

        if (!certificate) {
            return;
        }

        const value = Number(command.energyValue ?? certificate.owners[command.fromAddress]);

        certificate.owners[command.fromAddress] = (
            Number(certificate.owners[command.fromAddress]) - value
        ).toString();
        certificate.owners[command.toAddress] = (
            Number(certificate.owners[command.toAddress] ?? 0) + value
        ).toString();
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

    public async batchClaim(command: IClaimCommand[]): Promise<void> {
        if (command.length === 0) {
            return;
        }

        await Promise.all(command.map((claim) => this.claim(claim)));
    }

    public async batchTransfer(command: ITransferCommand[]): Promise<void> {
        if (command.length === 0) {
            return;
        }

        await Promise.all(command.map((transfer) => this.transfer(transfer)));
    }

    public async batchIssueWithTxHash(command: IIssueCommandParams<T>[]) {
        return { certificateIds: await this.batchIssue(command), transactionHash: 'txHash' };
    }

    public async batchTransferWithTxHash(command: ITransferCommand[]) {
        await this.batchTransfer(command);
        return { transactionHash: 'txHash' };
    }

    public async batchClaimWithTxHash(command: IClaimCommand[]) {
        await this.batchClaim(command);
        return { transactionHash: 'txHash' };
    }

    public async issueWithTxHash<T>(command: IIssueCommandParams<T>) {
        await this.issue(command as any);

        return {
            certificate: (this.db.find(
                (c) => c.deviceId === command.deviceId
            )! as unknown) as IIssuedCertificate<T>,
            transactionHash: 'txHash'
        };
    }

    public async transferWithTxHash(command: ITransferCommand) {
        await this.transfer(command);

        return { transactionHash: 'txHash' };
    }

    public async claimWithTxHash(command: IClaimCommand) {
        await this.claim(command);

        return { transactionHash: 'txHash' };
    }
}
