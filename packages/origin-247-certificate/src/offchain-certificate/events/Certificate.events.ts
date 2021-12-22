import { IEvent } from '@nestjs/cqrs';
import { IClaimCommand, IIssueCommand, ITransferCommand } from '../../types';

const version = 1;

export enum CertificateEventType {
    Issued = 'Issued',
    Transferred = 'Transferred',
    Claimed = 'Claimed',
    IssuancePersisted = 'IssuancePersisted',
    TransferPersisted = 'TransferPersisted',
    ClaimPersisted = 'ClaimPersisted',
    PersistError = 'PersistError'
}

export interface ICertificateEvent {
    type: CertificateEventType;
    version: number;
    internalCertificateId: number;
    payload: unknown;
    createdAt: Date;
}

export class CertificateIssuedEvent implements IEvent {
    public readonly type = CertificateEventType.Issued;
    public readonly version = version;
    public readonly createdAt = new Date();

    constructor(
        public readonly internalCertificateId: number,
        public readonly payload: IIssueCommand<unknown>
    ) {}
}

export class CertificateTransferredEvent implements IEvent {
    public readonly type = CertificateEventType.Transferred;
    public readonly version = version;
    public readonly createdAt = new Date();

    constructor(
        public readonly internalCertificateId: number,
        public readonly payload: ITransferCommand
    ) {}
}

export class CertificateClaimedEvent implements IEvent {
    public readonly type = CertificateEventType.Claimed;
    public readonly version = version;
    public readonly createdAt = new Date();

    constructor(
        public readonly internalCertificateId: number,
        public readonly payload: IClaimCommand
    ) {}
}

export class CertificateIssuancePersistedEvent implements IEvent {
    public readonly type = CertificateEventType.IssuancePersisted;
    public readonly version = version;
    public readonly createdAt = new Date();

    constructor(
        public readonly internalCertificateId: number,
        public readonly payload: { blockchainCertificateId: number }
    ) {}
}

export class CertificateTransferPersistedEvent implements IEvent {
    public readonly type = CertificateEventType.TransferPersisted;
    public readonly version = version;
    public readonly createdAt = new Date();

    constructor(public readonly internalCertificateId: number, public readonly payload: {}) {}
}

export class CertificateClaimPersistedEvent implements IEvent {
    public readonly type = CertificateEventType.ClaimPersisted;
    public readonly version = version;
    public readonly createdAt = new Date();

    constructor(public readonly internalCertificateId: number, public readonly payload: {}) {}
}

export class CertificatePersistErrorEvent implements IEvent {
    public readonly type = CertificateEventType.PersistError;
    public readonly version = version;
    public readonly createdAt = new Date();

    constructor(public internalCertificateId: number, public payload: { errorMessage: string }) {}
}
