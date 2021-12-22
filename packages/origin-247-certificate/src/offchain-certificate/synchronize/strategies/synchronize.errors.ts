import { CertificateEventEntity } from '../../repositories/CertificateEvent/CertificateEvent.entity';

export const cannotFindCorrespondingCommandErrorMessage = (event: CertificateEventEntity) =>
    `Cannot find command with id: ${event.commandId} corresponding to event ${event.id}`;
