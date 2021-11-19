import { CertificateEventEntity } from './CertificateEvent.entity';
import { ICertificateEvent } from '../../events/Certificate.events';

export const CERTIFICATE_EVENT_REPOSITORY = Symbol.for('CERTIFICATE_EVENT_REPOSITORY');

export interface FindOptions {
    eventId: number;
    createdAt: Date;
}

export enum CertificateEventColumns {
    Id = 'id',
    internalCertificateId = 'internalCertificateId',
    CommandId = 'commandId',
    CreatedAt = 'createdAt',
    Type = 'type',
    Version = 'version',
    Payload = 'payload'
}

export type NewCertificateEvent = Omit<CertificateEventEntity, 'id' | 'createdAt'>;

export interface CertificateEventRepository {
    save(event: ICertificateEvent, commandId: number): Promise<CertificateEventEntity>;

    getByInternalCertificateId(internalCertId: number): Promise<CertificateEventEntity[]>;

    getAll(): Promise<CertificateEventEntity[]>;
}