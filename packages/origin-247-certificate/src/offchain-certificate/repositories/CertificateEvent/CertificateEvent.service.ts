import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CertificateEventRepository } from './CertificateEvent.repository';
import { CertificateEventType, ICertificateEvent } from '../../events/Certificate.events';
import { CERTIFICATE_EVENT_REPOSITORY } from '../repository.keys';
import { ENTITY_MANAGER } from '../../utils/entity-manager';

@Injectable()
export class CertificateEventService {
    constructor(
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private certificateEventRepository: CertificateEventRepository,
        @Inject(ENTITY_MANAGER)
        private entityManager: EntityManager
    ) {}

    public async save(event: ICertificateEvent, commandId: number): Promise<ICertificateEvent> {
        return await this.entityManager.transaction(async (txManager) => {
            const savedEvent = await this.certificateEventRepository.save(
                {
                    internalCertificateId: event.internalCertificateId,
                    type: event.type,
                    version: event.version,
                    payload: event.payload,
                    createdAt: event.createdAt
                },
                commandId,
                txManager
            );

            if (this.shouldBeSynchronized(savedEvent)) {
                await this.certificateEventRepository.createSynchronizationAttempt(
                    savedEvent.id,
                    txManager
                );
            }

            return savedEvent;
        });
    }

    private shouldBeSynchronized(event: ICertificateEvent): boolean {
        const synchronizableEventTypes = [
            CertificateEventType.Issued,
            CertificateEventType.Claimed,
            CertificateEventType.Transferred
        ];

        return synchronizableEventTypes.includes(event.type);
    }
}
