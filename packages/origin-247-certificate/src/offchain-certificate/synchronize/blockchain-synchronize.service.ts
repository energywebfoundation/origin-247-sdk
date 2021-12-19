import { Inject, Injectable } from '@nestjs/common';
import {
    CERTIFICATE_EVENT_REPOSITORY,
    CertificateEventRepository
} from '../repositories/CertificateEvent/CertificateEvent.repository';
import { SYNCHRONIZE_STRATEGY, SynchronizeStrategy } from './strategies/synchronize.strategy';

@Injectable()
export class BlockchainSynchronizeService {
    constructor(
        @Inject(CERTIFICATE_EVENT_REPOSITORY)
        private readonly certEventRepo: CertificateEventRepository,

        @Inject(SYNCHRONIZE_STRATEGY)
        private readonly synchronizeStrategy: SynchronizeStrategy
    ) {}

    public async synchronize() {
        const events = await this.certEventRepo.getAllNotProcessed();

        await this.synchronizeStrategy.synchronize(events);
    }
}
