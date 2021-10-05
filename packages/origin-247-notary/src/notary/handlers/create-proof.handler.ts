import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';

import { CreateProofCommand } from '../commands/create-proof.command';
import { NotaryContractFacade } from '../notary-contract.facade';
import { NotaryProof } from '../notary-proof.entity';
import { NotaryService } from '../notary.service';
import { PersistProofCommand } from '../commands/persist-proof.command';

@CommandHandler(CreateProofCommand)
export class CreateProofHandler implements ICommandHandler<CreateProofCommand> {
    constructor(
        private readonly notaryService: NotaryService,
        private readonly commandBus: CommandBus
    ) {}

    async execute({ deviceId, readings }: CreateProofCommand): Promise<NotaryProof> {
        const notaryContract = await this.notaryService.getNotaryContract();

        const provider = new JsonRpcProvider(notaryContract.rpcNode);
        const deployerWallet = new Wallet(notaryContract.deployerPrivateKey, provider);

        const notaryContractFacade = new NotaryContractFacade(
            notaryContract.address,
            deployerWallet
        );

        const readingsWithUnixTimestamp = readings.map((r) => ({
            ...r,
            timestamp: Math.round(r.timestamp.getTime() / 1000)
        }));

        const { proof, tx } = await notaryContractFacade.storeMeterReadings(
            readingsWithUnixTimestamp
        );

        await tx.wait();

        return await this.commandBus.execute(new PersistProofCommand(deviceId, proof));
    }
}
