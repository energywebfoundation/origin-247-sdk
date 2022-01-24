import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { arrayToMap } from '../../utils/array';
import { CertificateEventEntity } from './CertificateEvent.entity';
import { CertificateEventRepository, IGetToProcessOptions } from './CertificateEvent.repository';
import {
    CertificateEventType,
    CertificateIssuancePersistedEvent,
    ICertificateEvent
} from '../../events/Certificate.events';
import { CertificateSynchronizationAttemptEntity } from './CertificateSynchronizationAttempt.entity';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '../../config/config.interface';

@Injectable()
export class CertificateEventPostgresRepository implements CertificateEventRepository {
    private readonly maxSynchronizationAttemptsForEvent: number;

    constructor(
        @InjectRepository(CertificateEventEntity)
        private repository: Repository<CertificateEventEntity>,
        @InjectRepository(CertificateSynchronizationAttemptEntity)
        private synchronizationAttemptRepository: Repository<CertificateSynchronizationAttemptEntity>,
        configService: ConfigService<Configuration>
    ) {
        this.maxSynchronizationAttemptsForEvent = configService.get(
            'MAX_SYNCHRONIZATION_ATTEMPTS_FOR_EVENT'
        )!;
    }

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
        event: Omit<ICertificateEvent, 'id'>,
        commandId: number,
        txManager: EntityManager | null
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

    public async createSynchronizationAttempt(
        eventId: number,
        txManager: EntityManager | null
    ): Promise<CertificateSynchronizationAttemptEntity> {
        const repository = txManager
            ? txManager.getRepository(CertificateSynchronizationAttemptEntity)
            : this.synchronizationAttemptRepository;

        return await repository.save({
            eventId,
            attemptsCount: 0
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

    public async findAllToProcess(params: IGetToProcessOptions): Promise<CertificateEventEntity[]> {
        const failedCertificatesIds = this.repository
            .createQueryBuilder('event')
            .select(['event.internalCertificateId'])
            .innerJoin(
                CertificateSynchronizationAttemptEntity,
                'attempt',
                'attempt.eventId = event.id'
            )
            .where(`(attempt.attempts_count >= :attempts)`, {
                attempts: this.maxSynchronizationAttemptsForEvent
            });

        const query = this.repository
            .createQueryBuilder('event')
            .select([
                'event.id',
                'event.internalCertificateId',
                'event.createdAt',
                'event.type',
                'event.version',
                'event.payload'
            ])
            .innerJoinAndSelect(
                CertificateSynchronizationAttemptEntity,
                'attempt',
                'attempt.eventId = event.id'
            )
            .where(
                `
                (
                    (attempt.attempts_count = 0) 
                    OR 
                    (attempt.error IS NOT NULL AND attempt.attempts_count < :attempts)
                )`,
                { attempts: this.maxSynchronizationAttemptsForEvent }
            )
            .andWhere(`event.internalCertificateId NOT IN (${failedCertificatesIds.getQuery()})`)
            .orderBy('event."createdAt"');

        if (params.limit) {
            return await query.limit(params.limit).getMany();
        } else {
            return await query.getMany();
        }
    }

    public async getOne(eventId: number): Promise<CertificateEventEntity> {
        const event = await this.repository.findOne(eventId);

        if (!event) {
            throw new NotFoundException();
        }

        return event;
    }

    public async getBlockchainIdMap(internalCertIds: number[]): Promise<Record<number, number>> {
        const events = ((await this.repository.find({
            where: {
                type: CertificateEventType.IssuancePersisted,
                internalCertificateId: In(internalCertIds)
            }
        })) as any) as CertificateIssuancePersistedEvent[]; // because of missing `_id` which is not relevant here

        return arrayToMap(
            events,
            (e) => e.internalCertificateId,
            (e) => e.payload.blockchainCertificateId
        );
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
