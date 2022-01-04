import { IClaim } from '@energyweb/issuer';

export interface IClaimPersistedCommand {}

export interface IIssuancePersistedCommand {
    blockchainCertificateId: number;
}

export interface ITransferPersistedCommand {}

export interface IPersistErrorCommand {
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
