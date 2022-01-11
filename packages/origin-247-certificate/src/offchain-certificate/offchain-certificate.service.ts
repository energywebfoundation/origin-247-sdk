import { Inject, Injectable } from '@nestjs/common';
import { CertificateCommandRepository } from './repositories/CertificateCommand/CertificateCommand.repository';
import { CertificateEventRepository } from './repositories/CertificateEvent/CertificateEvent.repository';
import { EventBus } from '@nestjs/cqrs';

import {
    IClaimCommand,
    IClaimPersistedCommand,
    IIssuancePersistedCommand,
    IIssueCommand,
    IIssueCommandParams,
    IPersistErrorCommand,
    ITransferCommand,
    ITransferPersistedCommand
} from '../types';

import {
    CertificateClaimedEvent,
    CertificateClaimPersistedEvent,
    CertificateIssuancePersistedEvent,
    CertificateIssuedEvent,
    CertificatePersistErrorEvent,
    CertificateTransferPersistedEvent,
    CertificateTransferredEvent,
    ICertificateEvent
} from './events/Certificate.events';

import { CertificateCommandEntity } from './repositories/CertificateCommand/CertificateCommand.entity';
import { CertificateReadModelRepository } from './repositories/CertificateReadModel/CertificateReadModel.repository';
import { CertificateAggregate } from './certificate.aggregate';
import { CertificateErrors } from './errors';
import {
    CERTIFICATE_COMMAND_REPOSITORY,
    CERTIFICATE_EVENT_REPOSITORY,
    CERTIFICATE_READ_MODEL_REPOSITORY
} from './repositories/repository.keys';
import { CertificateEventService } from './repositories/CertificateEvent/CertificateEvent.service';

@Injectable()
export class OffchainCertificateService<T = null> {
    constructor(
        @Inject(CERTIFICATE_COMMAND_REPOSITORY)
        private readonly certCommandRepo: CertificateCommandRepository,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,
        private readonly certificateEventService: CertificateEventService,
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
        const event = new CertificateIssuedEvent(
            await this.generateInternalCertificateId(),
            command
        );
        const aggregate = await this.createAggregate([event]);
        await this.propagate(event, savedCommand, aggregate);

        return event.internalCertificateId;
    }

    public async claim(command: IClaimCommand): Promise<void> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });
        const event = new CertificateClaimedEvent(command.certificateId, command);
        const aggregate = await this.createAggregate([event]);
        await this.propagate(event, savedCommand, aggregate);
    }

    public async transfer(command: ITransferCommand): Promise<void> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });
        const event = new CertificateTransferredEvent(command.certificateId, command);
        const aggregate = await this.createAggregate([event]);
        await this.propagate(event, savedCommand, aggregate);
    }

    public async issuePersisted(
        internalCertificateId: number,
        command: IIssuancePersistedCommand
    ): Promise<void> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });

        const event = new CertificateIssuancePersistedEvent(internalCertificateId, command);

        const aggregate = await this.createAggregate([event]);
        await this.propagate(event, savedCommand, aggregate);
    }

    public async claimPersisted(
        internalCertificateId: number,
        command: IClaimPersistedCommand
    ): Promise<void> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });

        const event = new CertificateClaimPersistedEvent(internalCertificateId, {});

        const aggregate = await this.createAggregate([event]);
        await this.propagate(event, savedCommand, aggregate);
    }

    public async transferPersisted(
        internalCertificateId: number,
        command: ITransferPersistedCommand
    ): Promise<void> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });

        const event = new CertificateTransferPersistedEvent(internalCertificateId, command);

        const aggregate = await this.createAggregate([event]);
        await this.propagate(event, savedCommand, aggregate);
    }

    public async persistError(
        internalCertificateId: number,
        command: IPersistErrorCommand
    ): Promise<void> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });

        const event = new CertificatePersistErrorEvent(internalCertificateId, command);

        const aggregate = await this.createAggregate([event]);
        await this.propagate(event, savedCommand, aggregate, command.errorMessage);
    }

    public async batchIssue(originalCertificates: IIssueCommandParams<T>[]): Promise<number[]> {
        const commands = originalCertificates.map((c) => ({
            ...c,
            fromTime: Math.round(c.fromTime.getTime() / 1000),
            toTime: Math.round(c.toTime.getTime() / 1000)
        }));
        await this.validateBatchIssue(commands);

        const certs: number[] = [];

        for (const certificate of originalCertificates) {
            const certificateId = await this.issue(certificate);
            certs.push(certificateId);
        }

        return certs;
    }

    public async batchClaim(commands: IClaimCommand[]): Promise<void> {
        await this.validateBatchClaim(commands);

        for (const command of commands) {
            await this.claim(command);
        }
    }

    public async batchTransfer(commands: ITransferCommand[]): Promise<void> {
        await this.validateBatchTransfer(commands);

        for (const command of commands) {
            await this.transfer(command);
        }
    }

    private async validateBatchIssue(commands: IIssueCommand<T>[]): Promise<void> {
        try {
            commands.forEach(async (c) => {
                CertificateAggregate.fromEvents([
                    new CertificateIssuedEvent(await this.generateInternalCertificateId(), c)
                ]);
            });
        } catch (err) {
            throw new CertificateErrors.BatchError(err);
        }
    }

    private async validateBatchClaim(commands: IClaimCommand[]): Promise<void> {
        const grouped = this.groupCommandsByCertificate(commands);

        try {
            for (const certificateId in grouped) {
                const events = grouped[certificateId].map((c) => {
                    return new CertificateClaimedEvent(parseInt(certificateId), c);
                });
                await this.createAggregate(events);
            }
        } catch (err) {
            throw new CertificateErrors.BatchError(err);
        }
    }

    private async validateBatchTransfer(commands: ITransferCommand[]): Promise<void> {
        const grouped = this.groupCommandsByCertificate(commands);

        try {
            for (const certificateId in grouped) {
                const events = grouped[certificateId].map((c) => {
                    return new CertificateTransferredEvent(parseInt(certificateId), c);
                });
                await this.createAggregate(events);
            }
        } catch (err) {
            throw new CertificateErrors.BatchError(err);
        }
    }

    private async createAggregate(events: ICertificateEvent[]): Promise<CertificateAggregate> {
        const aggregate = CertificateAggregate.fromEvents([
            ...(await this.certEventRepo.getByInternalCertificateId(
                events[0].internalCertificateId
            )),
            ...events
        ]);
        return aggregate;
    }

    private async generateInternalCertificateId(): Promise<number> {
        const numberOfCertificates = await this.certEventRepo.getNumberOfCertificates();
        return numberOfCertificates + 1;
    }

    private async propagate(
        event: ICertificateEvent,
        command: CertificateCommandEntity,
        aggregate: CertificateAggregate,
        errorMessage?: string
    ): Promise<void> {
        await this.eventBus.publish(event);
        const savedEvent = await this.certificateEventService.save(event, command.id);
        await this.readModelRepo.save(aggregate.getCertificate()!);
        await this.certEventRepo.updateAttempt({
            eventId: savedEvent.id,
            error: errorMessage
        });
    }

    private groupCommandsByCertificate<T extends { certificateId }>(
        commands: T[]
    ): Record<number, T[]> {
        const certificates: Record<number, T[]> = {};
        commands.forEach((command) => {
            const exists = certificates[command.certificateId];
            exists
                ? (certificates[command.certificateId] = [...exists, command])
                : (certificates[command.certificateId] = [command]);
        });
        return certificates;
    }
}