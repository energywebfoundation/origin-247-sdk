import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TransactionPollService } from './transaction-poll.service';
import { CertificateUpdatedEvent } from '@energyweb/issuer-api';

@EventsHandler(CertificateUpdatedEvent)
export class CertificateUpdatedHandler implements IEventHandler<CertificateUpdatedEvent> {
    constructor(private transactionPoll: TransactionPollService) {}

    async handle(event: CertificateUpdatedEvent) {
        const txHash = event.byTxHash;

        if (txHash) {
            await this.transactionPoll.saveTransactionAsProcessed(txHash);
        }
    }
}
