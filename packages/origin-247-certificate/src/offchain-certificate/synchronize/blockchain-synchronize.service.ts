import { Inject, Injectable } from '@nestjs/common';
import { CertificateEventRepository } from '../repositories/CertificateEvent/CertificateEvent.repository';
import { SYNCHRONIZE_STRATEGY, SynchronizeStrategy } from './strategies/synchronize.strategy';
import { CERTIFICATE_EVENT_REPOSITORY } from '../repositories/repository.keys';

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
