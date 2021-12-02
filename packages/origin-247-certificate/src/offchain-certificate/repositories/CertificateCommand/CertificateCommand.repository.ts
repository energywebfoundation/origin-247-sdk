import { CertificateCommandEntity } from './CertificateCommand.entity';

export const CERTIFICATE_COMMAND_REPOSITORY = Symbol.for('CERTIFICATE_COMMAND_REPOSITORY');

export interface FindOptions {
    eventId: number;
    createdAt: Date;
}

export enum CertificateCommandColumns {
    Id = 'id',
    CreatedAt = 'createdAt',
    Payload = 'payload'
}

export type NewCertificateCommand = Omit<CertificateCommandEntity, 'id' | 'createdAt'>;

export interface CertificateCommandRepository {
    save(certificateCommand: NewCertificateCommand): Promise<CertificateCommandEntity>;

    getById(commandId: number): Promise<CertificateCommandEntity | null>;

    getAll(): Promise<CertificateCommandEntity[]>;
}
