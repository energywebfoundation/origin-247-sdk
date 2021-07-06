import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CertificatePersistedEvent } from '@energyweb/origin-247-certificate';
import { TransferService } from '../transfer.service';

@EventsHandler(CertificatePersistedEvent)
export class CertificatePersistedEventHandler implements IEventHandler<CertificatePersistedEvent> {
    constructor(public transferService: TransferService) {}

    async handle({ certificateId }: CertificatePersistedEvent): Promise<void> {
        await this.transferService.persistRequestCertificate(certificateId);
    }
}
