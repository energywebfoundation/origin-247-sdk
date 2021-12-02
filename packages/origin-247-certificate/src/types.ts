import { IClaimData, IClaim } from '@energyweb/issuer';
export type UnixTimestamp = number;

export interface ICertificate<T = null> {
    id: number;
    deviceId: string;
    generationStartTime: number;
    generationEndTime: number;
    creationTime: number;
    owners: Record<string, string>;
    claimers: Record<string, string> | null;
    claims: IClaim[];
    creationBlockHash: string;
    issuedPrivately: boolean;
    metadata: T;
}
export interface IVolumeDistribution {
    publicVolume: string;
    privateVolume: string;
    claimedVolume: string;
}

export interface IIssuedCertificate<T = null> {
    id: number;
    deviceId: string;
    generationStartTime: number;
    generationEndTime: number;
    creationTime: number;
    metadata: T;
    creationBlockHash: string;
    energy: IVolumeDistribution;
    isClaimed: boolean;
    isOwned: boolean;
    myClaims: IClaim[];
    claims: IClaim[];
    issuedPrivately: false;
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

export interface IIssueCommandParams<T> {
    toAddress: string;
    userId: string;
    energyValue: string;
    fromTime: Date;
    toTime: Date;
    deviceId: string;
    metadata: T;
}

export interface IIssueCommand<T> {
    toAddress: string;
    userId: string;
    energyValue: string;
    fromTime: UnixTimestamp;
    toTime: UnixTimestamp;
    deviceId: string;
    metadata: T;
}

export interface IClaimCommand {
    certificateId: number;
    claimData: IClaimData;
    forAddress: string;
    energyValue?: string;
}

export interface ITransferCommand {
    certificateId: number;
    fromAddress: string;
    toAddress: string;
    energyValue?: string;
}

export interface IBatchIssueCommand<T> {
    certificates: IIssueCommand<T>[];
}

export interface IBatchClaimCommand {
    claims: IClaimCommand[];
}

export interface IBatchTransferCommand {
    transfers: ITransferCommand[];
}

export interface ISuccessResponse {
    success: boolean;
    statusCode?: number;
    message?: string;
}

export enum BlockchainActionType {
    Issuance = 'Issuance',
    Transfer = 'Transfer',
    Claim = 'Claim',
    BatchIssuance = 'BatchIssuance',
    BatchTransfer = 'BatchTransfer',
    BatchClaim = 'BatchClaim'
}

interface IAction<T, P> {
    type: T;
    payload: P;
}

export type BlockchainAction =
    | IAction<BlockchainActionType.Issuance, IIssueCommand<any>>
    | IAction<BlockchainActionType.Transfer, ITransferCommand>
    | IAction<BlockchainActionType.Claim, IClaimCommand>
    | IAction<BlockchainActionType.BatchIssuance, IBatchIssueCommand<any>>
    | IAction<BlockchainActionType.BatchTransfer, IBatchTransferCommand>
    | IAction<BlockchainActionType.BatchClaim, IBatchClaimCommand>;

export const CERTIFICATE_SERVICE_TOKEN = Symbol.for('CERTIFICATE_SERVICE_TOKEN');
export const OFFCHAIN_CERTIFICATE_SERVICE_TOKEN = Symbol.for('OFFCHAIN_CERTIFICATE_SERVICE_TOKEN');
