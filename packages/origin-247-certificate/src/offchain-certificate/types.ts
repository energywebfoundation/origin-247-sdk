import { IClaim } from '@energyweb/issuer';
import { CertificateEventType } from './events/Certificate.events';

export interface IClaimPersistedCommand {
    persistedEventId: number;
}

export interface IIssuancePersistedCommand {
    persistedEventId: number;
    blockchainCertificateId: number;
}

export interface ITransferPersistedCommand {
    persistedEventId: number;
}

export interface IPersistErrorCommand {
    internalCertificateId: number;
    type: CertificateEventType;
    errorMessage: string;
}

export interface ICertificateReadModel<T> {
    internalCertificateId: number;
    blockchainCertificateId: number | null;
    deviceId: string;
    generationStartTime: number;
    generationEndTime: number;
    creationTime: number;
    metadata: T;
    creationBlockHash: string;
    claims: IClaim[];
    owners: Record<string, string>;
    claimers: Record<string, string> | null;
}
