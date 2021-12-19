import { ProcessableEvent } from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateCommandEntity } from '../../repositories/CertificateCommand/CertificateCommand.entity';
import {
    BlockchainAction,
    BlockchainActionType,
    IClaimCommand,
    IIssueCommand,
    ITransferCommand
} from '../../../types';
import { CertificateEventType } from '../../events/Certificate.events';

export const SYNCHRONIZE_STRATEGY = Symbol.for('SYNCHRONIZE_STRATEGY');

export interface SynchronizeStrategy {
    synchronize(events: ProcessableEvent[]): Promise<void>;
}

export const createBlockchainJob = (
    event: ProcessableEvent,
    command: CertificateCommandEntity
): BlockchainAction => {
    switch (event.type) {
        case CertificateEventType.Claimed:
            return {
                type: BlockchainActionType.Claim,
                payload: command.payload as IClaimCommand
            };
        case CertificateEventType.Issued:
            return {
                type: BlockchainActionType.Issuance,
                payload: command.payload as IIssueCommand<any>
            };
        case CertificateEventType.Transferred:
            return {
                type: BlockchainActionType.Transfer,
                payload: command.payload as ITransferCommand
            };
    }
};
