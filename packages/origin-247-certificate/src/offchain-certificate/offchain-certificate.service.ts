import { Inject, Injectable } from '@nestjs/common';
import { CertificateCommandRepository } from './repositories/CertificateCommand/CertificateCommand.repository';
import { CertificateEventRepository } from './repositories/CertificateEvent/CertificateEvent.repository';
import { EventBus } from '@nestjs/cqrs';
import { IClaimCommand, IIssueCommand, IIssueCommandParams, ITransferCommand } from '../types';
import {
    ICertificateReadModel,
    IClaimPersistedCommand,
    IIssuancePersistedCommand,
    IPersistErrorCommand,
    ITransferPersistedCommand
} from './types';
import {
    CertificateClaimedEvent,
    CertificateClaimPersistedEvent,
    CertificateIssuancePersistedEvent,
    CertificateIssuedEvent,
    CertificatePersistErrorEvent,
    CertificateTransferPersistedEvent,
    CertificateTransferredEvent,
    ICertificateEvent,
    isPersistedEvent
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
import { IGetAllCertificatesOptions } from '@energyweb/issuer-api';
import {
    validateBatchClaimCommands,
    validateBatchIssueCommands,
    validateBatchTransferCommands,
    validateClaimCommand,
    validateIssueCommand,
    validateTransferCommand
} from './validators';

@Injectable()
export class OffChainCertificateService<T = null> {
    constructor(
        @Inject(CERTIFICATE_COMMAND_REPOSITORY)
        private readonly certCommandRepo: CertificateCommandRepository,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,
        private readonly certificateEventService: CertificateEventService,
        private readonly eventBus: EventBus,
        @Inject(CERTIFICATE_READ_MODEL_REPOSITORY)
        private readonly readModelRepo: CertificateReadModelRepository<T>
    ) {}

    public async getAll(
        options: IGetAllCertificatesOptions = {}
    ): Promise<ICertificateReadModel<T>[]> {
        const certificates = await this.readModelRepo.getAll(options);

        return certificates;
    }

    public async getById(id: number): Promise<ICertificateReadModel<T> | null> {
        const certificate = await this.readModelRepo.getByInternalCertificateId(id);

        return certificate;
    }

    public async getByIds(ids: number[]): Promise<ICertificateReadModel<T>[]> {
        const certificates = await this.readModelRepo.getManyByInternalCertificateIds(ids);

        return certificates;
    }

    public async issue(params: IIssueCommandParams<T>): Promise<number> {
        const command = {
            ...params,
            fromTime: Math.round(params.fromTime.getTime() / 1000),
            toTime: Math.round(params.toTime.getTime() / 1000)
        } as IIssueCommand<T>;
        await validateIssueCommand(command);

        return await this.issueWithoutValidation(command);
    }

    public async issueWithoutValidation(command: IIssueCommand<T>): Promise<number> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });
        const event = CertificateIssuedEvent.createNew(
            await this.generateInternalCertificateId(),
            command
        );
        const aggregate = await this.createAggregate([event]);
        await this.propagate(event, savedCommand, aggregate);

        return event.internalCertificateId;
    }

    public async claim(command: IClaimCommand): Promise<void> {
        await validateClaimCommand(command);
        return await this.claimWithoutValidation(command);
    }

    public async claimWithoutValidation(command: IClaimCommand): Promise<void> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });
        const event = CertificateClaimedEvent.createNew(command.certificateId, command);
        const aggregate = await this.createAggregate([event]);
        await this.propagate(event, savedCommand, aggregate);
    }

    public async transfer(command: ITransferCommand): Promise<void> {
        await validateTransferCommand(command);
        return await this.transferWithoutValidation(command);
    }
    public async transferWithoutValidation(command: ITransferCommand): Promise<void> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });
        const event = CertificateTransferredEvent.createNew(command.certificateId, command);
        const aggregate = await this.createAggregate([event]);
        await this.propagate(event, savedCommand, aggregate);
    }

    public async issuePersisted(
        internalCertificateId: number,
        command: IIssuancePersistedCommand
    ): Promise<void> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });

        const event = CertificateIssuancePersistedEvent.createNew(internalCertificateId, command);

        const aggregate = await this.createAggregate([event]);
        await this.propagate(event, savedCommand, aggregate);
    }

    public async claimPersisted(
        internalCertificateId: number,
        command: IClaimPersistedCommand
    ): Promise<void> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });

        const event = CertificateClaimPersistedEvent.createNew(internalCertificateId, command);

        const aggregate = await this.createAggregate([event]);
        await this.propagate(event, savedCommand, aggregate);
    }

    public async transferPersisted(
        internalCertificateId: number,
        command: ITransferPersistedCommand
    ): Promise<void> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });

        const event = CertificateTransferPersistedEvent.createNew(internalCertificateId, command);

        const aggregate = await this.createAggregate([event]);
        await this.propagate(event, savedCommand, aggregate);
    }

    public async persistError(
        internalCertificateId: number,
        command: IPersistErrorCommand
    ): Promise<void> {
        const savedCommand = await this.certCommandRepo.save({ payload: command });

        const event = CertificatePersistErrorEvent.createNew(internalCertificateId, command);

        const aggregate = await this.createAggregate([event]);
        await this.propagate(event, savedCommand, aggregate, command.errorMessage);
    }

    public async batchIssue(originalCertificates: IIssueCommandParams<T>[]): Promise<number[]> {
        const commands: IIssueCommand<T>[] = originalCertificates.map((c) => ({
            ...c,
            fromTime: Math.round(c.fromTime.getTime() / 1000),
            toTime: Math.round(c.toTime.getTime() / 1000)
        }));
        await validateBatchIssueCommands(commands);
        await this.validateBatchIssue(commands);

        const certs: number[] = [];

        for (const command of commands) {
            const certificateId = await this.issueWithoutValidation(command);
            certs.push(certificateId);
        }

        return certs;
    }

    public async batchClaim(commands: IClaimCommand[]): Promise<void> {
        await validateBatchClaimCommands(commands);
        await this.validateBatchClaim(commands);

        for (const command of commands) {
            await this.claimWithoutValidation(command);
        }
    }

    public async batchTransfer(commands: ITransferCommand[]): Promise<void> {
        await validateBatchTransferCommands(commands);
        await this.validateBatchTransfer(commands);

        for (const command of commands) {
            await this.transferWithoutValidation(command);
        }
    }

    private async validateBatchIssue(commands: IIssueCommand<T>[]): Promise<void> {
        try {
            commands.forEach((c) => {
                CertificateAggregate.fromEvents([CertificateIssuedEvent.createNew(-1, c)]);
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
                    return CertificateClaimedEvent.createNew(parseInt(certificateId), c);
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
                    return CertificateTransferredEvent.createNew(parseInt(certificateId), c);
                });
                await this.createAggregate(events);
            }
        } catch (err) {
            throw new CertificateErrors.BatchError(err);
        }
    }

    private async createAggregate(events: ICertificateEvent[]): Promise<CertificateAggregate<T>> {
        const aggregate = CertificateAggregate.fromEvents<T>([
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
        aggregate: CertificateAggregate<T>,
        errorMessage?: string
    ): Promise<void> {
        await this.eventBus.publish(event);
        await this.readModelRepo.save(aggregate.getCertificate()!);
        const savedEvent = await this.certificateEventService.save(event, command.id);

        if (isPersistedEvent(savedEvent)) {
            await this.certEventRepo.updateAttempt({
                eventId: savedEvent.payload.persistedEventId,
                error: errorMessage
            });
        }
    }

    private groupCommandsByCertificate<T extends { certificateId: number }>(
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
