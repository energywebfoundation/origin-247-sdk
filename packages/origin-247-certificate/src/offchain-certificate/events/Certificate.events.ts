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

export type PersistedEvent =
    | CertificateIssuancePersistedEvent
    | CertificateClaimPersistedEvent
    | CertificateTransferPersistedEvent
    | CertificatePersistErrorEvent;

export class CertificateIssuedEvent<MetadataType = unknown> implements ICertificateEvent {
    public readonly type = CertificateEventType.Issued;
    public readonly version = version;
    public readonly createdAt = new Date();

    constructor(
        public readonly internalCertificateId: number,
        public readonly payload: IIssueCommand<MetadataType>
    ) {}
}

export class CertificateTransferredEvent implements ICertificateEvent {
    public readonly type = CertificateEventType.Transferred;
    public readonly version = version;
    public readonly createdAt = new Date();

    constructor(
        public readonly internalCertificateId: number,
        public readonly payload: ITransferCommand
    ) {}
}

export class CertificateClaimedEvent implements ICertificateEvent {
    public readonly type = CertificateEventType.Claimed;
    public readonly version = version;
    public readonly createdAt = new Date();

    constructor(
        public readonly internalCertificateId: number,
        public readonly payload: IClaimCommand
    ) {}
}

export class CertificateIssuancePersistedEvent implements ICertificateEvent {
    public readonly type = CertificateEventType.IssuancePersisted;
    public readonly version = version;
    public readonly createdAt = new Date();

    constructor(
        public readonly internalCertificateId: number,
        public readonly payload: {
            blockchainCertificateId: number;
            persistedEventId: number;
            transactionHash: string;
        }
    ) {}
}

export class CertificateTransferPersistedEvent implements ICertificateEvent {
    public readonly type = CertificateEventType.TransferPersisted;
    public readonly version = version;
    public readonly createdAt = new Date();

    constructor(
        public readonly internalCertificateId: number,
        public readonly payload: { persistedEventId: number; transactionHash: string }
    ) {}
}

export class CertificateClaimPersistedEvent implements ICertificateEvent {
    public readonly type = CertificateEventType.ClaimPersisted;
    public readonly version = version;
    public readonly createdAt = new Date();

    constructor(
        public readonly internalCertificateId: number,
        public readonly payload: { persistedEventId: number; transactionHash: string }
    ) {}
}

export class CertificatePersistErrorEvent implements ICertificateEvent {
    public readonly type = CertificateEventType.PersistError;
    public readonly version = version;
    public readonly createdAt = new Date();

    constructor(
        public internalCertificateId: number,
        public payload: { errorMessage: string; persistedEventId: number }
    ) {}
}
