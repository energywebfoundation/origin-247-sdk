import { SynchronizableEvent } from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { ClaimPersistHandler } from './claim-persist.handler';
import { TransferPersistHandler } from './transfer-persist.handler';
import { Injectable } from '@nestjs/common';
import { SynchronizeHandler } from './synchronize.handler';
import { IssuePersistHandler } from './issue-persist.handler';

@Injectable()
export class SynchronizeManager {
    private readonly processors: SynchronizeHandler[] = [];

    constructor(
        private readonly claimPersistHandler: ClaimPersistHandler,
        private readonly issuancePersistHandler: IssuePersistHandler,
        private readonly transferPersistHandler: TransferPersistHandler
    ) {
        this.processors = [claimPersistHandler, transferPersistHandler, issuancePersistHandler];
    }

    public async handleBatch(events: SynchronizableEvent[]) {
        let processors: { handler: SynchronizeHandler; events: CertificateEventEntity[] }[] = [
            { handler: this.claimPersistHandler, events: [] },
            { handler: this.transferPersistHandler, events: [] },
            { handler: this.issuancePersistHandler, events: [] }
        ];

        for (let event of events) {
            processors = processors.map((processor) => {
                if (processor.handler.canHandle(event)) {
                    return {
                        events: [...processor.events, event],
                        handler: processor.handler
                    };
                }
                return processor;
            });
        }

        const failedCertificateIds: number[] = [];
        for (let processor of processors) {
            const eventsBatch = processor.events;

            const result = await processor.handler.handleBatch(eventsBatch);
            failedCertificateIds.push(...result.failedCertificateIds);
        }

        return { failedCertificateIds };
    }
}
