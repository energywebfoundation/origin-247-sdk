import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { CommandBus } from '@nestjs/cqrs';
import { BlockchainAction, BlockchainActionType } from './types';
import {
    ClaimCertificateCommand,
    IssueCertificateCommand,
    TransferCertificateCommand
} from '@energyweb/issuer-api';

@Processor('blockchain-actions')
export class BlockchainActionsProcessor {
    private readonly logger = new Logger(BlockchainActionsProcessor.name);

    constructor(private readonly commandBus: CommandBus) {}

    @Process({ concurrency: 1 })
    async handle(payload: Job<BlockchainAction>): Promise<any> {
        const result = await this.process(payload);

        /**
         * @HOTFIX 15.06.2021
         *
         * Sometimes we get conflicting nonce/gas price problem.
         * This time --may-- fix this, but not necessarily will.
         *
         * If you, in the future, will find this, please check whether this error is still present.
         * If not, maybe this really fixed this. If yes - just remove this await.
         */
        await new Promise((resolve) =>
            setTimeout(resolve, Number(process.env.CERTIFICATE_QUEUE_DELAY ?? 10000))
        );

        return result;
    }

    async process({ data }: Job<BlockchainAction>): Promise<any> {
        switch (data.type) {
            case BlockchainActionType.Issuance:
                const issuanceParams = data.payload;
                this.logger.debug(`Triggering issuance for: ${JSON.stringify(issuanceParams)}`);

                return await this.commandBus.execute(
                    new IssueCertificateCommand(
                        issuanceParams.toAddress,
                        issuanceParams.energyValue.toString(),
                        issuanceParams.fromTime,
                        issuanceParams.toTime,
                        issuanceParams.deviceId,
                        issuanceParams.userId,
                        false,
                        JSON.stringify(issuanceParams.metadata)
                    )
                );

            case BlockchainActionType.Transfer:
                const transferParams = data.payload;
                this.logger.debug(`Triggering transfer for: ${JSON.stringify(transferParams)}`);

                return await this.commandBus.execute(
                    new TransferCertificateCommand(
                        transferParams.certificateId,
                        transferParams.fromAddress,
                        transferParams.toAddress,
                        transferParams.energyValue
                            ? transferParams.energyValue.toString()
                            : undefined
                    )
                );

            case BlockchainActionType.Claim:
                const claimParams = data.payload;
                this.logger.debug(`Triggering claim for: ${JSON.stringify(claimParams)}`);

                return await this.commandBus.execute(
                    new ClaimCertificateCommand(
                        claimParams.certificateId,
                        claimParams.claimData,
                        claimParams.forAddress,
                        claimParams.energyValue ? claimParams.energyValue.toString() : undefined
                    )
                );
        }
    }
}
