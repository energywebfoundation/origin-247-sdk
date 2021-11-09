import { IEvent } from '@nestjs/cqrs';
import { IIssueCommand, ITransferCommand, IClaimCommand } from '../../types';

const version = 1;

export enum CertificateEventType {
    Issued = 'Issued',
    Transferred = 'Transferred',
    Claimed = 'Claimed',
    IssuancePersisted = 'IssuancePersisted',
    TransferPersisted = 'TransferPersisted',
    ClaimPersisted = 'ClaimPersisted'
}

export class CertificateIssuedEvent implements IEvent {
    public readonly type = CertificateEventType.Issued;
    public readonly version = version;

    constructor(public internalCertificateId: number, public payload: IIssueCommand<unknown>) {}
}

export class CertificateTransferredEvent implements IEvent {
    public readonly type = CertificateEventType.Transferred;
    public readonly version = version;

    constructor(public internalCertificateId: number, public payload: ITransferCommand) {}
}

export class CertificateClaimedEvent implements IEvent {
    public readonly type = CertificateEventType.Claimed;
    public readonly version = version;

    constructor(public internalCertificateId: number, public payload: IClaimCommand) {}
}

export class CertificateIssuancePersistedEvent implements IEvent {
    public readonly type = CertificateEventType.IssuancePersisted;
    public readonly version = version;

    constructor(
        public internalCertificateId: number,
        public blockchainCertificateId: number,
        public payload: IIssueCommand<unknown>
    ) {}
}

export class CertificateTransferPersistedEvent implements IEvent {
    public readonly type = CertificateEventType.TransferPersisted;
    public readonly version = version;

    constructor(
        public internalCertificateId: number,
        public blockchainCertificateId: number,
        public payload: ITransferCommand
    ) {}
}

export class CertificateClaimPersistedEvent implements IEvent {
    public readonly type = CertificateEventType.ClaimPersisted;
    public readonly version = version;

    constructor(
        public internalCertificateId: number,
        public blockchainCertificateId: number,
        public payload: IClaimCommand
    ) {}
}