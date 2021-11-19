import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CertificateEventEntity } from './CertificateEvent.entity';
import { CertificateEventRepository, NewCertificateEvent } from './CertificateEvent.repository';
import { ICertificateEvent } from '../../events/Certificate.events';
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
            commandId: commandId
        });
    }
}