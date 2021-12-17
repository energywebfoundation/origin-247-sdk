import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { CertificateEventEntity } from './CertificateEvent.entity';
import { CertificateEventRepository } from './CertificateEvent.repository';
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

    public async getAllNotProcessed(): Promise<CertificateEventEntity[]> {
        return await this.repository.find({
            where: {
                synchronized: false,
                synchronizeError: IsNull()
            }
        });
    }

    public async markAsSynchronized(eventId: number): Promise<CertificateEventEntity> {
        await this.repository.update(eventId, { synchronized: true });

        return this.getOne(eventId);
    }

    public async saveProcessingError(
        eventId: number,
        error: string
    ): Promise<CertificateEventEntity> {
        await this.repository.update(eventId, {
            synchronizeError: error
        });

        return this.getOne(eventId);
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
