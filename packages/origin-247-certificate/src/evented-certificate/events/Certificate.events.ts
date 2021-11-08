import { IEvent } from '@nestjs/cqrs';
import { IIssueCommand, ITransferCommand, IClaimCommand } from '../../types';
namespace Certificate {}
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

    constructor(
        public internalCertificateId: number,
        public version: number,
        public payload: IIssueCommand<unknown>
    ) {}
}

export class CertificateTransferredEvent implements IEvent {
    public readonly type = CertificateEventType.Transferred;

    constructor(
        public internalCertificateId: number,
        public version: number,
        public payload: ITransferCommand
    ) {}
}

export class CertificateClaimedEvent implements IEvent {
    public readonly type = CertificateEventType.Claimed;

    constructor(
        public internalCertificateId: number,
        public version: number,
        public payload: IClaimCommand
    ) {}
}

export class CertificateIssuancePersistedEvent implements IEvent {
    public readonly type = CertificateEventType.IssuancePersisted;

    constructor(
        public internalCertificateId: number,
        public blockchainCertificateId: number,
        public version: number,
        public payload: IIssueCommand<unknown>
    ) {}
}

export class CertificateTransferPersistedEvent implements IEvent {
    public readonly type = CertificateEventType.TransferPersisted;

    constructor(
        public internalCertificateId: number,
        public blockchainCertificateId: number,
        public version: number,
        public payload: ITransferCommand
    ) {}
}

export class CertificateClaimPersistedEvent implements IEvent {
    public readonly type = CertificateEventType.ClaimPersisted;

    constructor(
        public internalCertificateId: number,
        public blockchainCertificateId: number,
        public version: number,
        public payload: IClaimCommand
    ) {}
}
