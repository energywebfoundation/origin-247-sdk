import { ICertificateReadModel } from '../types';
import { CertificateEventType } from '../events/Certificate.events';

export const getCreationTransactionHash = <T>(
    certificate: ICertificateReadModel<T>
): string | undefined =>
    certificate.transactions.find((t) => t.eventType === CertificateEventType.IssuancePersisted)
        ?.transactionHash;
