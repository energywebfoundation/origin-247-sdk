import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';

export interface SynchronizeHandler {
    canHandle(event: CertificateEventEntity): boolean;

    handleBatch(events: CertificateEventEntity[]): Promise<{ failedCertificateIds: number[] }>;
}
