import { IClaim, IClaimData } from '@energyweb/issuer';

export type UnixTimestamp = number;

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
