import { SynchronizableEvent } from '../../repositories/CertificateEvent/CertificateEvent.repository';

export const SYNCHRONIZE_STRATEGY = Symbol.for('SYNCHRONIZE_STRATEGY');

export interface SynchronizeStrategy {
    synchronize(events: SynchronizableEvent[]): Promise<void>;
}
