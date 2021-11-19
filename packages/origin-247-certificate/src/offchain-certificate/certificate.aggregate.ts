import {
    ICertificateEvent,
    CertificateEventType,
    CertificateTransferredEvent,
    CertificateClaimedEvent
} from './events/Certificate.events';
import { IIssueCommand, ICertificateReadModel } from '../types';
import { CertificateErrors } from './errors';
import { BigNumber } from 'ethers';

interface ConstructorParams {}
interface FromEvents extends ConstructorParams {
    events: ICertificateEvent[];
    cert: never;
}
interface FromReadModel extends ConstructorParams {
    cert: ICertificateReadModel;
    events: never;
}
export class CertificateAggregate {
    private certificate: ICertificateReadModel | null = null;

    private constructor(params: FromEvents | FromReadModel) {
        if (params.events) {
            params.events
                .sort((first, second) => {
                    return first.internalCertificateId - second.internalCertificateId;
                })
                .forEach((event) => this.apply(event));
        } else {
            this.certificate = params.cert;
        }
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
        }
    }

    public getCertificate(): ICertificateReadModel | null {
        return this.certificate;
    }

    public static fromReadModel(certificate: ICertificateReadModel): CertificateAggregate {
        return new CertificateAggregate({ cert: certificate } as FromReadModel);
    }

    public static fromEvents(events: ICertificateEvent[]): CertificateAggregate {
        return new CertificateAggregate({ events: events } as FromEvents);
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

    private transfer(event: CertificateTransferredEvent): void {
        this.validateTransfer(event);

        const { fromAddress, toAddress, energyValue } = event.payload;

        const fromBalance = BigNumber.from(this.certificate!.owners[fromAddress] ?? '0');
        const toBalance = BigNumber.from(this.certificate!.owners[toAddress] ?? '0');

        const transferVolume = BigNumber.from(energyValue ?? '0');
        const newFromBalance = fromBalance.sub(transferVolume);
        const newToBalance = toBalance.add(transferVolume);

        this.certificate!.owners[fromAddress] = newFromBalance.toString();
        this.certificate!.owners[toAddress] = newToBalance.toString();
    }

    private claim(event: CertificateClaimedEvent): void {
        this.validateClaim(event);

        const { forAddress, energyValue, claimData } = event.payload;
        // claims happen for same address
        const transferVolume = BigNumber.from(energyValue ?? '0');
        const unclaimedBalance = BigNumber.from(this.certificate!.owners[forAddress]);
        const claimedBalance = BigNumber.from(
            this.certificate!.claimers![forAddress] ? this.certificate!.claimers![forAddress] : '0'
        );

        const newUnclaimedBalance = unclaimedBalance.sub(transferVolume);
        const newClaimedBalance = claimedBalance.add(transferVolume);

        this.certificate!.owners[forAddress] = newUnclaimedBalance.toString();
        this.certificate!.claimers![forAddress] = newClaimedBalance.toString();
        this.certificate!.claims.push({
            id: event.internalCertificateId,
            from: forAddress,
            to: forAddress,
            topic: '',
            value: energyValue ?? '0',
            claimData: claimData
        });
    }

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

        if (!this.hasEnoughBalance(fromAddress, energyValue ?? '0')) {
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

        if (!this.hasEnoughBalance(forAddress, energyValue ?? '0')) {
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
