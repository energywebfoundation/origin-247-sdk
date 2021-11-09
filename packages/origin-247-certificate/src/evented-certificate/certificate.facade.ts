import { Injectable, Inject } from '@nestjs/common';
import {
    CERTIFICATE_COMMAND_REPOSITORY,
    CertificateCommandRepository
} from './repositories/CertificateCommand/CertificateCommand.repository';
import {
    CERTIFICATE_EVENT_REPOSITORY,
    CertificateEventRepository
} from './repositories/CertificateEvent/CertificateEvent.repository';
import { EventBus } from '@nestjs/cqrs';

import {
    IClaimCommand,
    IIssueCommand,
    ITransferCommand,
    IIssuedCertificate,
    IIssueCommandParams
} from '../types';

import {
    CertificateIssuedEvent,
    CertificateTransferredEvent,
    CertificateClaimedEvent,
    ICertificateEvent
} from './events/Certificate.events';
import { CertificateCommandEntity } from './repositories/CertificateCommand/CertificateCommand.entity';

type CertificateCommand = IIssueCommand<unknown> | ITransferCommand | IClaimCommand;
@Injectable()
export class OffchainCertificateFacade<T = null> {
    constructor(
        @Inject(CERTIFICATE_COMMAND_REPOSITORY)
        private readonly certCommandRepo: CertificateCommandRepository,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,
        private readonly eventBus: EventBus
    ) {}

    public async issue(params: IIssueCommandParams<T>): Promise<number> {
        const command = {
            ...params,
            fromTime: Math.round(params.fromTime.getTime() / 1000),
            toTime: Math.round(params.toTime.getTime() / 1000)
        } as IIssueCommand<T>;

        const savedCommand = await this.certCommandRepo.create({ payload: command });
        this.validateCommand(command); // this will probably throw
        const event = new CertificateIssuedEvent(this.generateInternalCertificateId(), command);
        this.propagate(event, savedCommand);

        return event.internalCertificateId;
    }

    public async claim(command: IClaimCommand): Promise<void> {
        const savedCommand = await this.certCommandRepo.create({ payload: command });
        this.validateCommand(command);
        const event = new CertificateClaimedEvent(command.certificateId, command);
        this.propagate(event, savedCommand);
    }

    public async transfer(command: ITransferCommand): Promise<void> {
        const savedCommand = await this.certCommandRepo.create({ payload: command });
        this.validateCommand(command);
        const event = new CertificateTransferredEvent(command.certificateId, command);
        this.propagate(event, savedCommand);
    }

    public async batchIssue(originalCertificates: IIssueCommandParams<T>[]): Promise<number[]> {
        const certs = Promise.all(
            originalCertificates.map(async (cert: IIssueCommandParams<T>) => {
                const certificateId = await this.issue(cert);
                return certificateId;
            })
        );
        return certs;
    }

    public async batchClaim(command: IClaimCommand[]): Promise<void> {
        await Promise.all(
            command.map(async (c: IClaimCommand) => {
                await this.claim(c);
            })
        );
    }

    public async batchTransfer(command: ITransferCommand[]): Promise<void> {
        await Promise.all(
            command.map(async (c: ITransferCommand) => {
                await this.transfer(c);
            })
        );
    }

    // TODO: add actual validation
    private validateCommand(command: CertificateCommand): void {}

    // TODO: use uuid
    private generateInternalCertificateId(): number {
        return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    }

    private async propagate(
        event: ICertificateEvent,
        command: CertificateCommandEntity
    ): Promise<void> {
        this.eventBus.publish(event);
        this.certEventRepo.save(event, command.id);
    }
}
