import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { CertificateEventEntity } from './CertificateEvent.entity';
import {
    CertificateEventRepository,
    SynchronizableEvent,
    SynchronizableEventType
} from './CertificateEvent.repository';
import { CertificateEventType, ICertificateEvent } from '../../events/Certificate.events';
import { CertificateSynchronizationAttemptEntity } from './CertificateSynchronizationAttempt.entity';
import { CERTIFICATE_EVENT_REPOSITORY } from '../repository.keys';

@Injectable()
export class CertificateEventService {
    constructor(
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private certificateEventRepository: CertificateEventRepository,
        private entityManager: EntityManager
    ) {}

    public async save(
        event: ICertificateEvent,
        commandId: number
    ): Promise<CertificateEventEntity> {
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
                await txManager.getRepository(CertificateSynchronizationAttemptEntity).save({
                    attemptsCount: 0,
                    internalCertificateId: event.internalCertificateId,
                    type: event.type,
                    synchronized: false,
                    hasError: false
                });
            }

            return savedEvent;
        });
    }

    private shouldBeSynchronized(event: CertificateEventEntity): event is SynchronizableEvent {
        const synchronizableEventTypes = [
            CertificateEventType.Issued,
            CertificateEventType.Claimed,
            CertificateEventType.Transferred
        ] as SynchronizableEventType[];

        return synchronizableEventTypes.includes(event.type as any);
    }
}
