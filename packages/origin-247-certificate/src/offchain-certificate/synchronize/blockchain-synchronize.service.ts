import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CertificateEventType } from '../events/Certificate.events';
import {
    CERTIFICATE_COMMAND_REPOSITORY,
    CertificateCommandRepository
} from '../repositories/CertificateCommand/CertificateCommand.repository';
import {
    BlockchainAction,
    BlockchainActionType,
    IClaimCommand,
    IIssueCommand,
    ITransferCommand
} from '../../types';
import { CertificateEventEntity } from '../repositories/CertificateEvent/CertificateEvent.entity';
import {
    CERTIFICATE_EVENT_REPOSITORY,
    CertificateEventRepository
} from '../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateCommandEntity } from '../repositories/CertificateCommand/CertificateCommand.entity';
import { blockchainQueueName } from '../../blockchain-actions.processor';

type ProcessableEventType =
    | CertificateEventType.Issued
    | CertificateEventType.Transferred
    | CertificateEventType.Claimed;

type ProcessableEvent = CertificateEventEntity & { type: ProcessableEventType };

@Injectable()
export class BlockchainSynchronizeService {
    constructor(
        @Inject(CERTIFICATE_COMMAND_REPOSITORY)
        private readonly certCommandRepo: CertificateCommandRepository,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,
        @InjectQueue(blockchainQueueName)
        private readonly blockchainActionsQueue: Queue<BlockchainAction>
    ) {}

    public async synchronize() {
        const events = await this.certEventRepo.getAllNotProcessed();
        const notPersistedEvents = events.filter(
            (e) =>
                ![
                    CertificateEventType.IssuancePersisted,
                    CertificateEventType.TransferPersisted,
                    CertificateEventType.ClaimPersisted
                ].includes(e.type)
        ) as ProcessableEvent[];

        for (const event of notPersistedEvents) {
            const command = await this.certCommandRepo.getById(event.commandId);

            if (!command) {
                await this.certEventRepo.saveProcessingError(
                    event.id,
                    `Cannot find command with id: ${event.commandId} corresponding to event ${event.id}`
                );
            }

            await this.blockchainActionsQueue.add(
                BlockchainSynchronizeService.prepareJob(event, command as CertificateCommandEntity)
            );
            await this.certEventRepo.markAsSynchronized(event.id);
        }
    }

    private static prepareJob(
        event: ProcessableEvent,
        command: CertificateCommandEntity
    ): BlockchainAction {
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
    }
}
