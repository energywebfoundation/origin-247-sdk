import { SynchronizableEvent } from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { CertificateCommandEntity } from '../../repositories/CertificateCommand/CertificateCommand.entity';
import { ClaimPersistHandler } from './claim-persist.handler';
import { IssuancePersistHandler } from './issuance-persist.handler';
import { TransferPersistHandler } from './transfer-persist.handler';
import { Injectable } from '@nestjs/common';

export interface PersistHandler {
    canHandle(event: SynchronizableEvent): boolean;

    handle(event: CertificateEventEntity): Promise<void>;
}

@Injectable()
export class PersistProcessor {
    constructor(
        private readonly claimPersistHandler: ClaimPersistHandler,
        private readonly issuancePersistHandler: IssuancePersistHandler,
        private readonly transferPersistHandler: TransferPersistHandler
    ) {}

    public async handle(event: SynchronizableEvent) {
        const processors = [
            this.claimPersistHandler,
            this.transferPersistHandler,
            this.issuancePersistHandler
        ].filter((handler) => handler.canHandle(event));

        for (let processor of processors) {
            await processor.handle(event);
        }
    }
}
