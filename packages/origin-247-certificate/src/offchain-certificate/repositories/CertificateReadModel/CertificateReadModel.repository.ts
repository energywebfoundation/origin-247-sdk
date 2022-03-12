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

    getManyByBlockchainCertificateIds(
        blockchainCertificateIds: number[]
    ): Promise<ICertificateReadModel<T>[]>;

    getAll(options?: IGetAllCertificatesOptions): Promise<ICertificateReadModel<T>[]>;
}

export interface IGetAllCertificatesOptions {
    generationEndFrom?: Date;
    generationEndTo?: Date;
    generationStartFrom?: Date;
    generationStartTo?: Date;
    creationTimeFrom?: Date;
    creationTimeTo?: Date;
    deviceId?: string;
}
