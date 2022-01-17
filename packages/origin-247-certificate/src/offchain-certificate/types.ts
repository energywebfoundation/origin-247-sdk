import { IClaim } from '@energyweb/issuer';
import { CertificateEventType } from './events/Certificate.events';
import { CertificateTransaction } from './repositories/CertificateReadModel/CertificateReadModel.entity';

export interface IClaimPersistedCommand {
    persistedEventId: number;
    transactionHash: string;
}

export interface IIssuancePersistedCommand {
    persistedEventId: number;
    blockchainCertificateId: number;
    transactionHash: string;
}

export interface ITransferPersistedCommand {
    persistedEventId: number;
    transactionHash: string;
}

export interface IPersistErrorCommand {
    internalCertificateId: number;
    persistedEventId: number;
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
    isSynced: boolean;
    transactions: CertificateTransaction[];
}
