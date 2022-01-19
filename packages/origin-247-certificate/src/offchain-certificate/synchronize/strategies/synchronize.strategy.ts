import { ICertificateEvent } from '../../events/Certificate.events';

export const SYNCHRONIZE_STRATEGY = Symbol.for('SYNCHRONIZE_STRATEGY');

export interface SynchronizeStrategy {
    synchronize(events: ICertificateEvent[]): Promise<void>;
}
