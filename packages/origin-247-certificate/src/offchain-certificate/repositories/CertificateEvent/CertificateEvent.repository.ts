import { CertificateEventEntity } from './CertificateEvent.entity';
import { CertificateEventType, ICertificateEvent } from '../../events/Certificate.events';
import { EntityManager } from 'typeorm';
import { CertificateSynchronizationAttemptEntity } from './CertificateSynchronizationAttempt.entity';

export type SynchronizableEventType =
    | CertificateEventType.Issued
    | CertificateEventType.Transferred
    | CertificateEventType.Claimed;

export type SynchronizableEvent = CertificateEventEntity & { type: SynchronizableEventType };

export interface CertificateEventRepository {
    save(
        event: ICertificateEvent,
        commandId: number,
        txManager: EntityManager | null
    ): Promise<CertificateEventEntity>;

    getByInternalCertificateId(internalCertId: number): Promise<CertificateEventEntity[]>;

    updateAttempt(updateData: {
        internalCertificateId: number;
        type: CertificateEventType;
        synchronized: boolean;
        hasError: boolean;
    }): Promise<CertificateSynchronizationAttemptEntity>;

    getAll(): Promise<CertificateEventEntity[]>;

    getNumberOfCertificates(): Promise<number>;

    getAllNotProcessed(): Promise<SynchronizableEvent[]>;
}
