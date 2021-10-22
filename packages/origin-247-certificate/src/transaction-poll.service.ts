import { Injectable } from '@nestjs/common';
import { GetCertificateByTxHashQuery, Certificate } from '@energyweb/issuer-api';
import { QueryBus } from '@nestjs/cqrs';

const pollDelay = 3000;
const maxRetries = 100;

@Injectable()
export class TransactionPollService {
    constructor(private queryBus: QueryBus) {}

    public async waitForNewCertificates(txHash: string): Promise<Certificate[]> {
        return await this.pollNewCertificates(txHash);
    }

    private async pollNewCertificates(txHash: string, tryCount = 0): Promise<Certificate[]> {
        const result = await this.queryBus.execute(new GetCertificateByTxHashQuery(txHash));

        if (result.length === 0) {
            if (tryCount === 100) {
                throw new Error(
                    `Unable to query for transaction ${txHash} for ${maxRetries * pollDelay}ms`
                );
            }

            await new Promise((resolve) => setTimeout(resolve, pollDelay));

            return this.pollNewCertificates(txHash, tryCount + 1);
        }

        return result;
    }
}
