import { IClaim } from '@energyweb/issuer';

export const OFFCHAIN_CERTIFICATE_SERVICE_TOKEN = Symbol.for('OFFCHAIN_CERTIFICATE_SERVICE_TOKEN');

export interface IClaimPersistedCommand {}

export interface IIssuancePersistedCommand {
    blockchainCertificateId: number;
}

export interface ITransferPersistedCommand {}

export interface IPersistErrorCommand {
    errorMessage: string;
}

export interface ICertificateReadModel {
    internalCertificateId: number;
    blockchainCertificateId: number | null;
    deviceId: string;
    generationStartTime: number;
    generationEndTime: number;
    creationTime: number;
    metadata: unknown;
    creationBlockHash: string;
    claims: IClaim[];
    owners: Record<string, string>;
    claimers: Record<string, string> | null;
}
