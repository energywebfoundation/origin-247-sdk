import { Injectable, NotFoundException } from '@nestjs/common';
import { CertificateEventEntity } from './CertificateEvent.entity';
import { CertificateEventRepository, SynchronizableEvent } from './CertificateEvent.repository';
import { CertificateEventType, ICertificateEvent } from '../../events/Certificate.events';
import { CertificateSynchronizationAttemptEntity } from './CertificateSynchronizationAttempt.entity';

@Injectable()
export class CertificateEventInMemoryRepository implements CertificateEventRepository {
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
        event: ICertificateEvent,
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

    public async getAllNotProcessed(): Promise<SynchronizableEvent[]> {
        const attempts = Object.values(this.attemptDb).filter((a) => {
            return (
                (!a.error && a.attemptsCount === 0) ||
                (a.error && a.attemptsCount < this.maxSynchronizationAttemptsForEvent)
            );
        });

        const events = attempts.map((a) => {
            return this.eventDb.find((e) => e.id === a.eventId)!;
        });

        return events as SynchronizableEvent[];
    }

    public async getOne(eventId: number): Promise<CertificateEventEntity> {
        const event = this.eventDb.find((e) => e.id === eventId);

        if (!event) {
            throw new NotFoundException();
        }

        return event;
    }

    public async getNumberOfCertificates(): Promise<number> {
        return this.eventDb.filter((e) => e.type === CertificateEventType.Issued).length;
    }
}
