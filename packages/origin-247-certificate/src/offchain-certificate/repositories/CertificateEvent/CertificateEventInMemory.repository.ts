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
import { MAX_SYNCHRONIZATION_ATTEMPTS_FOR_EVENT } from '../../synchronize/blockchain-synchronize.const';
import { arrayToMap } from '../../utils/array';

@Injectable()
export class CertificateEventInMemoryRepository implements CertificateEventRepository {
    private eventDb: CertificateEventEntity[] = [];
    private attemptDb: Record<string, CertificateSynchronizationAttemptEntity> = {};

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

    public async getAllNotProcessed(): Promise<CertificateEventEntity[]> {
        const attempts = Object.values(this.attemptDb).filter((a) => {
            return (
                (!a.error && a.attemptsCount === 0) ||
                (a.error && a.attemptsCount < MAX_SYNCHRONIZATION_ATTEMPTS_FOR_EVENT)
            );
        });

        const events = attempts.map((a) => {
            return this.eventDb.find((e) => e.id === a.eventId)!;
        });

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

    public async getNumberOfCertificates(): Promise<number> {
        return this.eventDb.filter((e) => e.type === CertificateEventType.Issued).length;
    }
}
