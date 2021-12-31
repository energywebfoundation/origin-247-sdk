import { SynchronizableEvent } from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { ClaimPersistHandler } from './claim-persist.handler';
import { IssuePersistHandler } from './issue-persist-handler.service';
import { TransferPersistHandler } from './transfer-persist.handler';
import { Injectable } from '@nestjs/common';

export interface PersistHandler {
    canHandle(event: CertificateEventEntity): boolean;

    handle(event: CertificateEventEntity): Promise<{ success: boolean }>;

    handleBatch(events: CertificateEventEntity[]): Promise<{ failedCertificateIds: number[] }>;
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
        const applicableProcessor = this.processors.find((handler) => handler.canHandle(event));

        if (!applicableProcessor) {
            throw new Error(`Cannot find handler to process event of type: ${event.type}`);
        }

        return await applicableProcessor.handle(event);
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

        const failedCertificateIds: number[] = [];
        for (let processor of processors) {
            const eventsBatch = processor.events;

            const result = await processor.handler.handleBatch(eventsBatch);
            failedCertificateIds.push(...result.failedCertificateIds);
        }

        return { failedCertificateIds };
    }
}
