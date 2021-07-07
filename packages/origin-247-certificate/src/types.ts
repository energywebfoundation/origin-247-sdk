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

export interface IIssuedCertificate<T = null> {
    id: number;
    deviceId: string;
    generationStartTime: number;
    generationEndTime: number;
    creationTime: number;
    metadata: T;
    creationBlockHash: string;
    energy: { publicVolume: string; privateVolume: string; claimedVolume: string };
    isClaimed: boolean;
    isOwned: boolean;
    myClaims: IClaim[];
    claims: IClaim[];
    issuedPrivately: false;
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

export interface ISuccessResponse {
    success: boolean;
    statusCode?: number;
    message?: string;
}

export enum BlockchainActionType {
    Issuance = 'Issuance',
    Transfer = 'Transfer',
    Claim = 'Claim'
}

interface IAction<T, P> {
    type: T;
    payload: P;
}

export type BlockchainAction =
    | IAction<BlockchainActionType.Issuance, IIssueCommand<any>>
    | IAction<BlockchainActionType.Transfer, ITransferCommand>
    | IAction<BlockchainActionType.Claim, IClaimCommand>;

export const CERTIFICATE_SERVICE_TOKEN = Symbol.for('CERTIFICATE_SERVICE_TOKEN');
