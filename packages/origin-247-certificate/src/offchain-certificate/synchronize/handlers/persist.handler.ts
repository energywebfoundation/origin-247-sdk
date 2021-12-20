import { ProcessableEvent } from '../../repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';
import { CertificateCommandEntity } from '../../repositories/CertificateCommand/CertificateCommand.entity';
import { ClaimPersistHandler } from './claim-persist.handler';
import { IssuancePersistHandler } from './issuance-persist.handler';
import { TransferPersistHandler } from './transfer-persist.handler';

export interface PersistHandler {
    canHandle(event: ProcessableEvent): boolean;

    handle(event: CertificateEventEntity, command: CertificateCommandEntity): Promise<void>;

    handleBatch(
        events: CertificateEventEntity[],
        commands: CertificateCommandEntity[]
    ): Promise<void>;
}

export class PersistProcessor {
    private readonly processors: PersistHandler[] = [];

    constructor(
        private readonly claimPersistHandler: ClaimPersistHandler,
        private readonly issuancePersistHandler: IssuancePersistHandler,
        private readonly transferPersistHandler: TransferPersistHandler
    ) {
        this.processors = [claimPersistHandler, transferPersistHandler, issuancePersistHandler];
    }

    public async handle(event: ProcessableEvent, command: CertificateCommandEntity) {
        const applicableProcessors = this.processors.filter((handler) => handler.canHandle(event));

        for (let processor of applicableProcessors) {
            await processor.handle(event, command);
        }
    }

    public async handleBatch(events: ProcessableEvent[], commands: CertificateCommandEntity[]) {
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
            const commandsIdsBatch = eventsBatch.map((event) => event.commandId);

            await processor.handler.handleBatch(
                eventsBatch,
                commands.filter((command) => commandsIdsBatch.includes(command.id))
            );
        }
    }
}
