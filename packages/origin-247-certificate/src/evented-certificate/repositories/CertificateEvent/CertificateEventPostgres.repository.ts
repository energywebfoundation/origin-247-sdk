import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';

import { CertificateEventEntity } from './CertificateEvent.entity';
import { CertificateEventRepository, NewCertificateEvent } from './CertificateEvent.repository';

@Injectable()
export class CertificateEventPostgresRepository implements CertificateEventRepository {
    constructor(
        @InjectRepository(CertificateEventEntity)
        private repository: Repository<CertificateEventEntity>
    ) {}

    public async create(generation: NewCertificateEvent): Promise<CertificateEventEntity> {
        return await this.repository.save(generation);
    }

    public async getAll(): Promise<CertificateEventEntity[]> {
        return await this.repository.find();
    }

    public async findByInternalCertificate(
        internalCertId: number
    ): Promise<CertificateEventEntity | null> {
        const found = await this.repository.findOne({
            where: {
                internalCertificateId: internalCertId
            }
        });
        return found ?? null;
    }
}
