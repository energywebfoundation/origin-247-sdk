import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CertificateEventEntity } from './CertificateEvent.entity';
import { CertificateEventRepository, SynchronizableEvent } from './CertificateEvent.repository';
import { CertificateEventType, ICertificateEvent } from '../../events/Certificate.events';
import { CertificateSynchronizationAttemptEntity } from './CertificateSynchronizationAttempt.entity';

@Injectable()
export class CertificateEventPostgresRepository implements CertificateEventRepository {
    constructor(
        @InjectRepository(CertificateEventEntity)
        private repository: Repository<CertificateEventEntity>,
        @InjectRepository(CertificateSynchronizationAttemptEntity)
        private synchronizationAttemptRepository: Repository<CertificateSynchronizationAttemptEntity>,
        private entityManager: EntityManager
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
        commandId: number,
        txManager
    ): Promise<CertificateEventEntity> {
        const repository = txManager
            ? txManager.getRepository(CertificateEventEntity)
            : this.repository;

        return await repository.save({
            internalCertificateId: event.internalCertificateId,
            type: event.type,
            version: event.version,
            payload: event.payload,
            createdAt: event.createdAt,
            commandId: commandId
        });
    }

    public async updateAttempt({
        eventId,
        error
    }): Promise<CertificateSynchronizationAttemptEntity> {
        const synchronizationAttempt = await this.synchronizationAttemptRepository.findOne(eventId);

        if (!synchronizationAttempt) {
            throw new Error('Synchronization attempt does not exist');
        }

        synchronizationAttempt.attemptsCount = synchronizationAttempt.attemptsCount + 1;
        synchronizationAttempt.error = error ?? null;

        await this.synchronizationAttemptRepository.update(
            synchronizationAttempt.eventId,
            synchronizationAttempt
        );

        return synchronizationAttempt;
    }

    public async getAllNotProcessed(): Promise<SynchronizableEvent[]> {
        const query = this.repository
            .createQueryBuilder('event')
            .select([
                'event.id',
                'event.internalCertificateId',
                'event.createdAt',
                'event.commandId',
                'event.type',
                'event.version',
                'event.payload'
            ])
            .leftJoinAndSelect(
                CertificateSynchronizationAttemptEntity,
                'attempt',
                'attempt.eventId = event.id'
            )
            .where('attempt.error IS NULL')
            .andWhere('attempt.attempts_count = 0');

        return (await query.getMany()) as SynchronizableEvent[];
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
