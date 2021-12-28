import { SynchronizableEvent } from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { ClaimPersistHandler } from './claim-persist.handler';
import { IssuePersistHandler } from './issue-persist-handler.service';
import { TransferPersistHandler } from './transfer-persist.handler';
import { Injectable } from '@nestjs/common';

export interface PersistHandler {
    canHandle(event: CertificateEventEntity): boolean;

    handle(event: CertificateEventEntity): Promise<void>;

    handleBatch(events: CertificateEventEntity[]): Promise<void>;
}

@Injectable()
export class PersistProcessor {
    private readonly processors: PersistHandler[] = [];

    constructor(
        private readonly claimPersistHandler: ClaimPersistHandler,
        private readonly issuancePersistHandler: IssuePersistHandler,
        private readonly transferPersistHandler: TransferPersistHandler
    ) {
        this.processors = [claimPersistHandler, transferPersistHandler, issuancePersistHandler];
    }

    public async handle(event: SynchronizableEvent) {
        const applicableProcessors = this.processors.filter((handler) => handler.canHandle(event));

        for (let processor of applicableProcessors) {
            await processor.handle(event);
        }
    }

    public async handleBatch(events: SynchronizableEvent[]) {
        let processors: { handler: PersistHandler; events: CertificateEventEntity[] }[] = [
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

        for (let processor of processors) {
            const eventsBatch = processor.events;

            await processor.handler.handleBatch(eventsBatch);
        }
    }
}
