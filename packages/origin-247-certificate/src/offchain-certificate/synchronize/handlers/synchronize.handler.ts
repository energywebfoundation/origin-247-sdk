import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';

export interface SynchronizeHandler {
    canHandle(event: CertificateEventEntity): boolean;

    handle(event: CertificateEventEntity): Promise<{ success: boolean }>;

    handleBatch(events: CertificateEventEntity[]): Promise<{ failedCertificateIds: number[] }>;
}
