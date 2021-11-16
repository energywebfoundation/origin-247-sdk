import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { CertificateReadModelEntity } from './CertificateReadModel.entity';
import { CertificateReadModelRepository } from './CertificateReadModel.repository';

@Injectable()
export class CertificateReadModelPostgresRepository implements CertificateReadModelRepository {
    constructor(
        @InjectRepository(CertificateReadModelEntity)
        private repository: Repository<CertificateReadModelEntity>
    ) {}

    async save(
        certificateReadModel: CertificateReadModelEntity
    ): Promise<CertificateReadModelEntity> {
        return await this.repository.save(certificateReadModel);
    }

    async getAll(): Promise<CertificateReadModelEntity[]> {
        return await this.repository.find();
    }

    async getByInternalCertificateId(
        internalCertificateId: number
    ): Promise<CertificateReadModelEntity | null> {
        const found = await this.repository.findOne({
            where: {
                internalCertificateId: internalCertificateId
            }
        });
        return found ?? null;
    }

    async getManyByInternalCertificateIds(
        internalCertificateIds: number[]
    ): Promise<CertificateReadModelEntity[]> {
        return await this.repository.find({
            where: {
                internalCertificateId: In(internalCertificateIds)
            }
        });
    }
}
