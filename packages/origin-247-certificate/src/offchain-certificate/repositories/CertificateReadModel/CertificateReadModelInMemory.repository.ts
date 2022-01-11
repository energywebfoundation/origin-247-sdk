import { IGetAllCertificatesOptions } from '@energyweb/issuer-api';
import { Injectable } from '@nestjs/common';
import { CertificateReadModelEntity } from './CertificateReadModel.entity';
import { CertificateReadModelRepository } from './CertificateReadModel.repository';

@Injectable()
export class CertificateReadModelInMemoryRepository<T>
    implements CertificateReadModelRepository<T> {
    private db: CertificateReadModelEntity<T>[] = [];

    async save(
        certificateReadModel: CertificateReadModelEntity<T>
    ): Promise<CertificateReadModelEntity<T>> {
        this.db.push(certificateReadModel);

        return certificateReadModel;
    }

    async getByInternalCertificateId(
        internalCertificateId: number
    ): Promise<CertificateReadModelEntity<T> | null> {
        const found = await this.db.find((e) => e.internalCertificateId === internalCertificateId);

        return found ?? null;
    }

    async getManyByInternalCertificateIds(
        internalCertificateIds: number[]
    ): Promise<CertificateReadModelEntity<T>[]> {
        return this.db.filter((e) => internalCertificateIds.includes(e.internalCertificateId));
    }

    async getAll(
        options: IGetAllCertificatesOptions = {}
    ): Promise<CertificateReadModelEntity<T>[]> {
        const lastDate = new Date('2030-01-01T00:00:00.000Z');
        const generationEndFrom = options.generationEndFrom ?? new Date(0);
        const generationEndTo = options.generationEndTo ?? lastDate;
        const generationStartFrom = options.generationStartFrom ?? new Date(0);
        const generationStartTo = options.generationStartTo ?? lastDate;
        const creationTimeFrom = options.creationTimeFrom ?? new Date(0);
        const creationTimeTo = options.creationTimeTo ?? lastDate;
        const deviceId = options.deviceId;

        return this.db.filter((entry) => {
            const isDateOk =
                new Date(entry.generationStartTime * 1000) >= generationStartFrom &&
                new Date(entry.generationStartTime * 1000) <= generationStartTo &&
                new Date(entry.generationEndTime * 1000) >= generationEndFrom &&
                new Date(entry.generationEndTime * 1000) <= generationEndTo &&
                new Date(entry.creationTime * 1000) >= creationTimeFrom &&
                new Date(entry.creationTime * 1000) <= creationTimeTo;

            const isDeviceOk = deviceId ? deviceId === entry.deviceId : true;

            return isDateOk && isDeviceOk;
        });
    }
}
