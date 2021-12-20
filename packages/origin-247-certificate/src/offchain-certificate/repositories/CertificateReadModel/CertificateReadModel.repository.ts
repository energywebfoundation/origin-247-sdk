import { ICertificateReadModel } from '../../../types';
import { CertificateReadModelEntity } from './CertificateReadModel.entity';

export interface FindOptions {}

export enum CertificateReadModelColumns {}

export type NewCertificateReadModel = Omit<
    CertificateReadModelEntity,
    'id' | 'createdAt' | 'updatedAt'
>;

export interface CertificateReadModelRepository {
    save(certificateRM: NewCertificateReadModel): Promise<CertificateReadModelEntity>;

    getByInternalCertificateId(
        internalCertificateId: number
    ): Promise<ICertificateReadModel | null>;

    getManyByInternalCertificateIds(
        internalCertificateIds: number[]
    ): Promise<ICertificateReadModel[]>;

    getAll(): Promise<ICertificateReadModel[]>;
}
