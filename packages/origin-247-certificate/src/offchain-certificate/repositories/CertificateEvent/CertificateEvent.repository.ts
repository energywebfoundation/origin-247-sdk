import { ICertificateEvent } from '../../events/Certificate.events';
import { EntityManager } from 'typeorm';
import { CertificateSynchronizationAttemptEntity } from './CertificateSynchronizationAttempt.entity';

export interface IGetToProcessOptions {
    limit: number | null;
}

export interface CertificateEventRepository {
    save(
        event: Omit<ICertificateEvent, 'id'>,
        commandId: number,
        txManager: EntityManager | null
    ): Promise<ICertificateEvent>;

    createSynchronizationAttempt(
        eventId: number,
        txManager: EntityManager | null
    ): Promise<CertificateSynchronizationAttemptEntity>;

    getByInternalCertificateId(internalCertId: number): Promise<ICertificateEvent[]>;

    /**
     * @NOTE not found blockchain ids will not be included in the map
     */
    getBlockchainIdMap(internalCertIds: number[]): Promise<Record<number, number>>;

    updateAttempt(updateData: {
        eventId: number;
        error?: string;
    }): Promise<CertificateSynchronizationAttemptEntity>;

    getAll(): Promise<ICertificateEvent[]>;

    getNextInternalCertificateId(): Promise<number>;

    findAllToProcess(options: IGetToProcessOptions): Promise<ICertificateEvent[]>;
}
