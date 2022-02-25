import { IGetAllCertificatesOptions } from '@energyweb/issuer-api';
import { ICertificateReadModel } from '../../types';
import { CertificateReadModelEntity } from './CertificateReadModel.entity';

export interface FindOptions {}

export enum CertificateReadModelColumns {}

export type NewCertificateReadModel<T> = Omit<
    CertificateReadModelEntity<T>,
    'id' | 'createdAt' | 'updatedAt'
>;

export interface CertificateReadModelRepository<T> {
    save(certificateRM: NewCertificateReadModel<T>): Promise<CertificateReadModelEntity<T>>;

    saveMany(
        certificateRMs: NewCertificateReadModel<T>[]
    ): Promise<CertificateReadModelEntity<T>[]>;

    getByInternalCertificateId(
        internalCertificateId: number
    ): Promise<ICertificateReadModel<T> | null>;

    getManyByInternalCertificateIds(
        internalCertificateIds: number[]
    ): Promise<ICertificateReadModel<T>[]>;

    getAll(options?: IGetAllCertificatesOptions): Promise<ICertificateReadModel<T>[]>;
}
