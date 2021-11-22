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

import { IClaimCommand, IIssueCommand, ITransferCommand, IIssueCommandParams } from '../types';

import {
    CertificateIssuedEvent,
    CertificateTransferredEvent,
    CertificateClaimedEvent,
    ICertificateEvent
} from './events/Certificate.events';

import { CertificateCommandEntity } from './repositories/CertificateCommand/CertificateCommand.entity';
import {
    CertificateReadModelRepository,
    CERTIFICATE_READ_MODEL_REPOSITORY
} from './repositories/CertificateReadModel/CertificateReadModel.repository';
import { CertificateAggregate } from './certificate.aggregate';

@Injectable()
export class OffchainCertificateService<T = null> {
    constructor(
        @Inject(CERTIFICATE_COMMAND_REPOSITORY)
        private readonly certCommandRepo: CertificateCommandRepository,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,
        private readonly eventBus: EventBus,
        @Inject(CERTIFICATE_READ_MODEL_REPOSITORY)
        private readonly readModelRepo: CertificateReadModelRepository
    ) {}

    public async issue(params: IIssueCommandParams<T>): Promise<number> {
        const command = {
            ...params,
            fromTime: Math.round(params.fromTime.getTime() / 1000),
            toTime: Math.round(params.toTime.getTime() / 1000)
        } as IIssueCommand<T>;

        const savedCommand = await this.certCommandRepo.save({ payload: command });
        const event = new CertificateIssuedEvent(this.generateInternalCertificateId(), command);
        const aggregate = await this.createAggregate(event);
        await this.propagate(event, savedCommand, aggregate);

        return event.internalCertificateId;
    }

    public async claim(command: IClaimCommand): Promise<void> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });
        const event = new CertificateClaimedEvent(command.certificateId, command);
        const aggregate = await this.createAggregate(event);
        await this.propagate(event, savedCommand, aggregate);
    }

    public async transfer(command: ITransferCommand): Promise<void> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });
        const event = new CertificateTransferredEvent(command.certificateId, command);
        const aggregate = await this.createAggregate(event);
        await this.propagate(event, savedCommand, aggregate);
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

    public async batchClaim(commands: IClaimCommand[]): Promise<void> {
        for (const command of commands) {
            await this.claim(command);
        }
    }

    public async batchTransfer(commands: ITransferCommand[]): Promise<void> {
        for (const command of commands) {
            await this.transfer(command);
        }
    }

    private async createAggregate(event: ICertificateEvent): Promise<CertificateAggregate> {
        const readModel = await this.readModelRepo.getByInternalCertificateId(
            event.internalCertificateId
        );

        let aggregate: CertificateAggregate;

        if (readModel) {
            aggregate = CertificateAggregate.fromReadModel(readModel);
            aggregate.apply(event);
        } else {
            aggregate = CertificateAggregate.fromEvents([
                ...(await this.certEventRepo.getByInternalCertificateId(
                    event.internalCertificateId
                )),
                event
            ]);
        }
        return aggregate;
    }

    private generateInternalCertificateId(): number {
        return new Date().getTime();
    }

    private async propagate(
        event: ICertificateEvent,
        command: CertificateCommandEntity,
        aggregate: CertificateAggregate
    ): Promise<void> {
        await this.eventBus.publish(event);
        await this.certEventRepo.save(event, command.id);
        await this.readModelRepo.save(aggregate.getCertificate()!);
    }
}
