import { ProcessableEvent } from '../../repositories/CertificateEvent/CertificateEvent.repository';

export const SYNCHRONIZE_STRATEGY = Symbol.for('SYNCHRONIZE_STRATEGY');

export interface SynchronizeStrategy {
    synchronize(events: ProcessableEvent[]): Promise<void>;
}
