import { Injectable } from '@nestjs/common';
import { GetCertificateByTxHashQuery, Certificate } from '@energyweb/issuer-api';
import { QueryBus } from '@nestjs/cqrs';

const pollDelay = 5000;
const maxRetries = 200;

@Injectable()
export class TransactionPollService {
    /**
     * @NOTE
     *
     * If:
     * 1. replaced by a persistent storage (redis)
     * 2. issuer-api allows to call to check if transaction was processed
     * then on application startup we could see if we still await some transactions.
     *
     * This may not be possible at this point, since if application fails (so the startup happens),
     * then the job will not be awaited on the client side, so the result would not matter anyway.
     */
    private processedTransactions: Record<string, true> = {};

    constructor(private queryBus: QueryBus) {}

    public async waitForNewCertificates(txHash: string): Promise<Certificate[]> {
        return await this.poll(txHash, async (hash) => {
            const result: Certificate[] = await this.queryBus.execute(
                new GetCertificateByTxHashQuery(hash)
            );

            if (result.length === 0) {
                return new Error('Could not find certificate');
            }

            return result;
        });
    }

    public async waitForTransaction(txHash: string): Promise<void> {
        await this.poll(txHash, async (hash) => {
            const isPresent = hash in this.processedTransactions;

            if (isPresent) {
                delete this.processedTransactions[hash];
            } else {
                return new Error('Transaction was not registered');
            }
        });
    }

    public async saveTransactionAsProcessed(txHash: string): Promise<void> {
        this.processedTransactions[txHash] = true;
    }

    private async poll<T>(
        txHash: string,
        cb: (txHash: string) => Promise<T | Error>,
        tryCount = 0
    ): Promise<T> {
        const result = await cb(txHash);

        if (result instanceof Error) {
            if (tryCount === maxRetries) {
                throw new Error(
                    `Unable to query for transaction ${txHash} for ${
                        maxRetries * pollDelay
                    }ms. Latest reason: ${result.message}`
                );
            }

            await new Promise((resolve) => setTimeout(resolve, pollDelay));

            return this.poll(txHash, cb, tryCount + 1);
        }

        return result;
    }
}
