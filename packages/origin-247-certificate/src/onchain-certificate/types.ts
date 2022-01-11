import { IClaim } from '@energyweb/issuer';
import {
    IBatchClaimCommand,
    IBatchIssueCommand,
    IBatchTransferCommand,
    IClaimCommand,
    IIssueCommand,
    ITransferCommand,
    UnixTimestamp
} from '../types';

export interface ICertificate<T = null> {
    id: number;
    deviceId: string;
    generationStartTime: UnixTimestamp;
    generationEndTime: UnixTimestamp;
    creationTime: UnixTimestamp;
    owners: Record<string, string>;
    claimers: Record<string, string> | null;
    claims: IClaim[];
    creationBlockHash: string;
    issuedPrivately: boolean;
    metadata: T;
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

export const ONCHAIN_CERTIFICATE_SERVICE_TOKEN = Symbol.for('ONCHAIN_CERTIFICATE_SERVICE_TOKEN');
