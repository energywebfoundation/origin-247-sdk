import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';

import { CertificateEventEntity } from './CertificateEvent.entity';
import { CertificateEventRepository, SynchronizableEvent } from './CertificateEvent.repository';
import { CertificateEventType, ICertificateEvent } from '../../events/Certificate.events';

@Injectable()
export class CertificateEventPostgresRepository implements CertificateEventRepository {
    constructor(
        @InjectRepository(CertificateEventEntity)
        private repository: Repository<CertificateEventEntity>
    ) {}

    public async getAll(): Promise<CertificateEventEntity[]> {
        return await this.repository.find();
    }

    public async getByInternalCertificateId(
        internalCertId: number
    ): Promise<CertificateEventEntity[]> {
        return await this.repository.find({
            where: {
                internalCertificateId: internalCertId
            }
        });
    }

    public async save(
        event: ICertificateEvent,
        commandId: number
    ): Promise<CertificateEventEntity> {
        return await this.repository.save({
            internalCertificateId: event.internalCertificateId,
            type: event.type,
            version: event.version,
            payload: event.payload,
            createdAt: event.createdAt,
            commandId: commandId
        });
    }

    public async getAllNotProcessed(): Promise<SynchronizableEvent[]> {
        const processedWithErrors = await this.repository.find({
            where: { type: CertificateEventType.PersistError },
            select: ['internalCertificateId']
        });
        const issuePersisted = await this.repository.find({
            where: { type: CertificateEventType.IssuancePersisted },
            select: ['internalCertificateId']
        });
        const claimPersisted = await this.repository.find({
            where: { type: CertificateEventType.ClaimPersisted },
            select: ['internalCertificateId']
        });
        const transferPersisted = await this.repository.find({
            where: { type: CertificateEventType.TransferPersisted },
            select: ['internalCertificateId']
        });

        const eventsToProcess = await this.repository.find({
            where: {
                type: In([
                    CertificateEventType.Transferred,
                    CertificateEventType.Issued,
                    CertificateEventType.Claimed
                ]),
                internalCertificateId: Not(
                    In(processedWithErrors.map((e) => e.internalCertificateId))
                )
            }
        });

        const eventTypeToPersistedEvents = {
            [CertificateEventType.Issued]: issuePersisted,
            [CertificateEventType.Claimed]: claimPersisted,
            [CertificateEventType.Transferred]: transferPersisted
        };

        return eventsToProcess.filter((event) => {
            const persistedEvents = eventTypeToPersistedEvents[event.type];
            return !persistedEvents.some(
                (e) => e.internalCertificateId === event.internalCertificateId
            );
        }) as SynchronizableEvent[];
    }

    public async getOne(eventId: number): Promise<CertificateEventEntity> {
        const event = await this.repository.findOne(eventId);

        if (!event) {
            throw new NotFoundException();
        }

        return event;
    }

    public async getNumberOfCertificates(): Promise<number> {
        const [certs, count] = await this.repository.findAndCount({
            where: {
                type: CertificateEventType.Issued
            }
        });

        return count;
    }
}
