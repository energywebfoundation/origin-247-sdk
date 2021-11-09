import { Injectable, Inject } from '@nestjs/common';
import {
    CERTIFICATE_COMMAND_REPOSITORY,
    CertificateCommandRepository
} from './repositories/CertificateCommand/CertificateCommand.repository';
import {
    CERTIFICATE_EVENT_REPOSITORY,
    CertificateEventRepository
} from './repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateService } from '../certificate.service';
import { QueryBus, EventBus } from '@nestjs/cqrs';
import { GetAllCertificatesQuery, GetCertificateQuery } from '@energyweb/issuer-api';
import { CertificateEventType } from './events/Certificate.events';

import {
    ICertificate,
    IClaimCommand,
    IIssueCommand,
    ITransferCommand,
    ISuccessResponse,
    BlockchainActionType,
    BlockchainAction,
    IIssuedCertificate,
    IIssueCommandParams
} from '../types';
import {
    CertificateIssuedEvent,
    CertificateTransferredEvent,
    CertificateClaimedEvent
} from './events/Certificate.events';

const CertificateEventVersion = 1;

type CertificateCommand = IIssueCommand<unknown> | ITransferCommand | IClaimCommand;
@Injectable()
export class CertificateFacade<T = null> {
    constructor(
        @Inject(CERTIFICATE_COMMAND_REPOSITORY)
        private readonly certCommandRepo: CertificateCommandRepository,
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,
        private readonly certService: CertificateService,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus
    ) {}

    public async issue(params: IIssueCommandParams<T>): Promise<IIssuedCertificate<T>> {
        const command = {
            ...params,
            fromTime: Math.round(params.fromTime.getTime() / 1000),
            toTime: Math.round(params.toTime.getTime() / 1000)
        } as IIssueCommand<T>;

        const savedCommand = await this.certCommandRepo.create({ payload: command });
        this.validateCommand(command); // this will probably throw

        const internalCertId = this.generateInternalCertificateId();
        const event = new CertificateIssuedEvent(internalCertId, CertificateEventVersion, command);

        this.eventBus.publish(event);
        this.certEventRepo.create({
            internalCertificateId: event.internalCertificateId,
            blockchainCertificateId: null,
            commandId: savedCommand.id,
            type: event.type,
            version: event.version,
            payload: event.payload
        });

        const certificate: IIssuedCertificate<T> = {
            claims: [],
            myClaims: [],
            creationBlockHash: '',
            creationTime: Math.floor(Date.now() / 1000),
            deviceId: params.deviceId,
            generationStartTime: Math.floor(params.fromTime.getTime() / 1000),
            generationEndTime: Math.floor(params.toTime.getTime() / 1000),
            id: internalCertId,
            issuedPrivately: false,
            isOwned: true,
            isClaimed: false,
            metadata: params.metadata,
            energy: {
                privateVolume: '0',
                claimedVolume: '0',
                publicVolume: params.energyValue
            }
        };
        return certificate;
    }

    public async claim(command: IClaimCommand): Promise<void> {
        const savedCommand = await this.certCommandRepo.create({ payload: command });
        this.validateCommand(command);
        const event = new CertificateClaimedEvent(
            command.certificateId,
            CertificateEventVersion,
            command
        );
        this.eventBus.publish(event);
        this.certEventRepo.create({
            internalCertificateId: command.certificateId,
            blockchainCertificateId: null,
            commandId: savedCommand.id,
            type: event.type,
            version: event.version,
            payload: event.payload
        });
    }

    public async transfer(command: ITransferCommand): Promise<void> {
        const savedCommand = await this.certCommandRepo.create({ payload: command });
        this.validateCommand(command);
        const event = new CertificateTransferredEvent(
            command.certificateId,
            CertificateEventVersion,
            command
        );
        this.eventBus.publish(event);
        this.certEventRepo.create({
            internalCertificateId: command.certificateId,
            blockchainCertificateId: null,
            commandId: savedCommand.id,
            type: event.type,
            version: event.version,
            payload: event.payload
        });
    }

    public async batchIssue(originalCertificates: IIssueCommandParams<T>[]): Promise<number[]> {
        const certs = Promise.all(
            originalCertificates.map(async (cert: IIssueCommandParams<T>) => {
                const certificate = await this.issue(cert);
                return certificate.id;
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
}
