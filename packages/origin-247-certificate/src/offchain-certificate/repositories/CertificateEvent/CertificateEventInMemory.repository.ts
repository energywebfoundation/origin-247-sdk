import { Injectable, NotFoundException } from '@nestjs/common';
import { CertificateEventEntity } from './CertificateEvent.entity';
import { CertificateEventRepository } from './CertificateEvent.repository';
import {
    CertificateEventType,
    CertificateIssuancePersistedEvent,
    ICertificateEvent,
    isIssuePersistedEvent
} from '../../events/Certificate.events';
import { CertificateSynchronizationAttemptEntity } from './CertificateSynchronizationAttempt.entity';
import { arrayToMap } from '../../utils/array';
import { chain } from 'lodash';

@Injectable()
export class CertificateEventInMemoryRepository implements CertificateEventRepository {
    private internalCertificateIdSerial: number = 0;
    private eventDb: CertificateEventEntity[] = [];
    private attemptDb: Record<string, CertificateSynchronizationAttemptEntity> = {};
    private maxSynchronizationAttemptsForEvent: number = Infinity;

    public async getAll(): Promise<CertificateEventEntity[]> {
        return this.eventDb;
    }

    public async getByInternalCertificateId(
        internalCertId: number
    ): Promise<CertificateEventEntity[]> {
        return this.eventDb.filter((e) => e.internalCertificateId === internalCertId);
    }

    public async save(
        event: Omit<ICertificateEvent, 'id'>,
        commandId: number
    ): Promise<CertificateEventEntity> {
        const entity = {
            internalCertificateId: event.internalCertificateId,
            type: event.type,
            version: event.version,
            payload: event.payload,
            createdAt: event.createdAt,
            commandId: commandId,
            id: this.eventDb.length + 1
        };

        this.eventDb.push(entity);

        return entity;
    }

    public async createSynchronizationAttempt(
        eventId: number
    ): Promise<CertificateSynchronizationAttemptEntity> {
        const entity = {
            eventId,
            attemptsCount: 0,
            createdAt: new Date()
        };

        this.attemptDb[eventId] = entity;

        return entity;
    }

    public async updateAttempt({
        eventId,
        error
    }): Promise<CertificateSynchronizationAttemptEntity> {
        const synchronizationAttempt = await this.attemptDb[eventId];

        if (!synchronizationAttempt) {
            throw new Error('Synchronization attempt does not exist');
        }

        synchronizationAttempt.attemptsCount = synchronizationAttempt.attemptsCount + 1;
        synchronizationAttempt.error = error ?? null;

        return synchronizationAttempt;
    }

    public async findAllToProcess(): Promise<CertificateEventEntity[]> {
        const failedEventIds = Object.values(this.attemptDb)
            .filter((a) => a.error && a.attemptsCount > this.maxSynchronizationAttemptsForEvent)
            .map((a) => a.eventId);
        const failedCerts = chain(this.eventDb)
            .filter((e) => failedEventIds.includes(e.id))
            .map((e) => e.internalCertificateId)
            .compact()
            .uniq()
            .value();

        const attempts = Object.values(this.attemptDb).filter((a) => {
            return (
                (!a.error && a.attemptsCount === 0) ||
                (a.error && a.attemptsCount < this.maxSynchronizationAttemptsForEvent)
            );
        });

        const events = chain(attempts)
            .map((a) => this.eventDb.find((e) => e.id === a.eventId))
            .compact()
            .filter((e) => !failedCerts.includes(e.internalCertificateId))
            .value();

        return events;
    }

    public async getOne(eventId: number): Promise<CertificateEventEntity> {
        const event = this.eventDb.find((e) => e.id === eventId);

        if (!event) {
            throw new NotFoundException();
        }

        return event;
    }

    public async getBlockchainIdMap(internalCertIds: number[]): Promise<Record<number, number>> {
        // This guard in filter should work (properly map type), but whatever reason it keeps original type
        const issuanceEvents = (this.eventDb.filter(
            isIssuePersistedEvent
        ) as any) as CertificateIssuancePersistedEvent[];
        const events = issuanceEvents.filter((e) =>
            internalCertIds.includes(e.internalCertificateId)
        );

        const idMap = arrayToMap(
            events,
            (e) => e.internalCertificateId,
            (e) => e.payload.blockchainCertificateId
        );

        return idMap;
    }

    public async getNextInternalCertificateId(): Promise<number> {
        this.internalCertificateIdSerial += 1;

        return this.internalCertificateIdSerial;
    }
}
