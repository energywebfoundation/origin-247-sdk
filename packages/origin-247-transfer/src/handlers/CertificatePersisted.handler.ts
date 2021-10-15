import { CertificatePersistedEvent } from '@energyweb/issuer-api';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PersistanceService } from '../persistance.service';

@EventsHandler(CertificatePersistedEvent)
export class CertificatePersistedHandler implements IEventHandler<CertificatePersistedEvent> {
    constructor(private persistanceService: PersistanceService) {}

    async handle(event: CertificatePersistedEvent) {
        const certificateId = event.certificateId;
        const isTemporarilyPersisted = await this.persistanceService.isTemporarilyPersisted(
            certificateId
        );

        if (isTemporarilyPersisted) {
            await this.persistanceService.markEtrPersisted(certificateId);
        } else {
            await this.persistanceService.markTemporarilyPersisted(certificateId);
        }
    }
}
