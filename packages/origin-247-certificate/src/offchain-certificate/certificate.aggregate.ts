import {
    CertificateClaimedEvent,
    CertificateClaimPersistedEvent,
    CertificateEventType,
    CertificateIssuancePersistedEvent,
    CertificateTransferPersistedEvent,
    CertificateTransferredEvent,
    ICertificateEvent
} from './events/Certificate.events';
import { ICertificateReadModel, IIssueCommand } from '../types';
import { CertificateErrors } from './errors';
import { BigNumber } from 'ethers';
import { compareDates } from '../utils/date-utils';

export class CertificateAggregate {
    private certificate: ICertificateReadModel | null = null;

    private constructor(events: ICertificateEvent[]) {
        events
            .sort((first, second) => compareDates(first.createdAt, second.createdAt))
            .forEach((event) => this.apply(event));
    }

    public apply(event: ICertificateEvent): void {
        switch (event.type) {
            case CertificateEventType.Issued:
                this.issue(event);
                break;
            case CertificateEventType.Transferred:
                this.transfer(event as CertificateTransferredEvent);
                break;
            case CertificateEventType.Claimed:
                this.claim(event as CertificateClaimedEvent);
                break;
            case CertificateEventType.ClaimPersisted:
                this.claimPersisted(event as CertificateClaimPersistedEvent);
                break;
            case CertificateEventType.IssuancePersisted:
                this.issuancePersisted(event as CertificateIssuancePersistedEvent);
                break;
            case CertificateEventType.TransferPersisted:
                this.transferPersisted(event as CertificateTransferPersistedEvent);
                break;
        }
    }

    public getCertificate(): ICertificateReadModel | null {
        return this.certificate;
    }

    public static fromEvents(events: ICertificateEvent[]): CertificateAggregate {
        return new CertificateAggregate(events);
    }

    private issue(event: ICertificateEvent): void {
        if (this.isIssued()) {
            throw new CertificateErrors.Issuance.CertificateAlreadyIssued(
                event.internalCertificateId
            );
        }
        const payload = event.payload as IIssueCommand<unknown>;

        this.certificate = {
            internalCertificateId: event.internalCertificateId,
            blockchainCertificateId: null,
            claims: [],
            creationBlockHash: '',
            creationTime: Math.floor(Date.now() / 1000),
            deviceId: payload.deviceId,
            generationStartTime: Math.floor(payload.fromTime),
            generationEndTime: Math.floor(payload.toTime),
            metadata: payload.metadata as any,
            owners: {
                [payload.toAddress]: payload.energyValue
            },
            claimers: {}
        };
    }

    private issuancePersisted(event: CertificateIssuancePersistedEvent): void {
        const { blockchainCertificateId } = event.payload;

        this.certificate!.blockchainCertificateId = blockchainCertificateId;
    }

    private transfer(event: CertificateTransferredEvent): void {
        this.validateTransfer(event);

        const { fromAddress, toAddress, energyValue } = event.payload;

        const fromBalance = BigNumber.from(this.certificate!.owners[fromAddress] ?? '0');
        const toBalance = BigNumber.from(this.certificate!.owners[toAddress] ?? '0');

        const transferVolume = BigNumber.from(energyValue ?? fromBalance);
        const newFromBalance = fromBalance.sub(transferVolume);
        const newToBalance = toBalance.add(transferVolume);

        this.certificate!.owners[fromAddress] = newFromBalance.toString();
        this.certificate!.owners[toAddress] = newToBalance.toString();
    }

    private transferPersisted(event: CertificateTransferPersistedEvent): void {}

    private claim(event: CertificateClaimedEvent): void {
        this.validateClaim(event);

        const { forAddress, energyValue, claimData } = event.payload;
        // claims happen for same address

        const unclaimedBalance = BigNumber.from(this.certificate!.owners[forAddress]);
        const claimedBalance = BigNumber.from(
            this.certificate!.claimers![forAddress] ? this.certificate!.claimers![forAddress] : '0'
        );
        const transferVolume = BigNumber.from(energyValue ?? unclaimedBalance);

        const newUnclaimedBalance = unclaimedBalance.sub(transferVolume);
        const newClaimedBalance = claimedBalance.add(transferVolume);

        this.certificate!.owners[forAddress] = newUnclaimedBalance.toString();
        this.certificate!.claimers![forAddress] = newClaimedBalance.toString();
        this.certificate!.claims.push({
            id: event.internalCertificateId,
            from: forAddress,
            to: forAddress,
            topic: '',
            value: transferVolume.toString(),
            claimData: claimData
        });
    }

    private claimPersisted(event: CertificateClaimPersistedEvent): void {}

    private validateTransfer(event: CertificateTransferredEvent): void {
        const {
            internalCertificateId,
            payload: { fromAddress, toAddress, energyValue }
        } = event;

        if (!this.isIssued()) {
            throw new CertificateErrors.Transfer.CertificateNotIssued(internalCertificateId);
        }

        if (this.isZeroAddress(fromAddress)) {
            throw new CertificateErrors.Transfer.FromZeroAddress(internalCertificateId);
        }

        if (this.isZeroAddress(toAddress)) {
            throw new CertificateErrors.Transfer.ToZeroAddress(internalCertificateId);
        }

        if (
            !this.hasEnoughBalance(
                fromAddress,
                energyValue ?? this.certificate!.owners[fromAddress]
            )
        ) {
            throw new CertificateErrors.Transfer.NotEnoughBalance(
                internalCertificateId,
                fromAddress
            );
        }
    }

    private validateClaim(event: CertificateClaimedEvent): void {
        const {
            internalCertificateId,
            payload: { forAddress, energyValue }
        } = event;

        if (!this.isIssued()) {
            throw new CertificateErrors.Claim.CertificateNotIssued(internalCertificateId);
        }

        if (this.isZeroAddress(forAddress)) {
            throw new CertificateErrors.Claim.ForZeroAddress(internalCertificateId);
        }

        if (
            !this.hasEnoughBalance(forAddress, energyValue ?? this.certificate!.owners[forAddress])
        ) {
            throw new CertificateErrors.Claim.NotEnoughBalance(internalCertificateId, forAddress);
        }
    }

    private isIssued(): boolean {
        return this.certificate?.internalCertificateId !== undefined;
    }

    private isZeroAddress(address: string): boolean {
        return parseInt(address, 16) === 0;
    }

    private hasEnoughBalance(address: string, volume: string): boolean {
        const addressBalance = this.certificate?.owners[address];
        return (
            addressBalance !== undefined &&
            BigNumber.from(addressBalance).gte(BigNumber.from(volume))
        );
    }
}
