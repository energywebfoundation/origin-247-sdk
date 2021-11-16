import { ICertificateReadModel } from '../../../types';
import { CertificateReadModelEntity } from './CertificateReadModel.entity';

export const CERTIFICATE_READ_MODEL_REPOSITORY = Symbol.for('CERTIFICATE_READ_MODEL_REPOSITORY');

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
