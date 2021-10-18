import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
    EnergyTransferRequestRepository,
    ENERGY_TRANSFER_REQUEST_REPOSITORY
} from './repositories/EnergyTransferRequest.repository';

const getKey = (certificateId: number) => `persistance_service_${certificateId}`;
type StoredDataType = true;

/**
 * This service allows to synchronize race condition between response from batchIssue and actual
 * persistance in issuer-api.
 *
 * Both CertificatePersistedHandler and batchIssue check if certificate was processed by another other,
 * using this "temporarilyPersisted" concept, and if eventually hard persist certificate in database.
 */

@Injectable()
export class PersistanceService {
    private logger = new Logger(PersistanceService.name);

    constructor(
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        @Inject(ENERGY_TRANSFER_REQUEST_REPOSITORY)
        private etrRepository: EnergyTransferRequestRepository
    ) {}

    public async markTemporarilyPersisted(certificateId: number): Promise<void> {
        const week_in_seconds = 7 * 24 * 60 * 60;

        await this.cacheManager.set<StoredDataType>(getKey(certificateId), true, {
            ttl: week_in_seconds
        });
    }

    public async isTemporarilyPersisted(certificateId: number): Promise<boolean> {
        return (await this.cacheManager.get<StoredDataType>(getKey(certificateId))) ?? false;
    }

    public async markEtrPersisted(certificateId: number): Promise<void> {
        const etr = await this.etrRepository.findByCertificateId(certificateId);

        if (!etr) {
            this.logger.error(
                `Trying to mark ETR with certificateId: ${certificateId} as persisted, but such doesn't exist`
            );
            return;
        }

        etr.persisted();

        await this.etrRepository.save(etr);
    }
}
