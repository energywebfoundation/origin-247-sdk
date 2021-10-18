import { CertificatePersistedEvent } from '@energyweb/issuer-api';
import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AwaitingValidationEvent } from '../batch/validate.batch';
import { PersistanceService } from '../persistance.service';

@EventsHandler(CertificatePersistedEvent)
export class CertificatePersistedHandler implements IEventHandler<CertificatePersistedEvent> {
    constructor(private persistanceService: PersistanceService, private eventBus: EventBus) {}

    async handle(event: CertificatePersistedEvent) {
        const certificateId = event.certificateId;
        const isTemporarilyPersisted = await this.persistanceService.isTemporarilyPersisted(
            certificateId
        );

        if (isTemporarilyPersisted) {
            await this.persistanceService.markEtrPersisted(certificateId);
            this.eventBus.publish(new AwaitingValidationEvent());
        } else {
            await this.persistanceService.markTemporarilyPersisted(certificateId);
        }
    }
}
