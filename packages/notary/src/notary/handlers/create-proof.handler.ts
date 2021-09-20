import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { getProviderWithFallback } from '@energyweb/utils-general';
import { InternalServerErrorException } from '@nestjs/common';

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
        if (!process.env.WEB3) {
            throw new InternalServerErrorException(`Please set process.env.WEB3`);
        }

        if (!process.env.DEPLOY_KEY) {
            throw new InternalServerErrorException(`Please set process.env.DEPLOY_KEY`);
        }

        const notary = await this.notaryService.getNotaryContract();
        const signer = getProviderWithFallback(process.env.WEB3);
        const notaryContractFacade = new NotaryContractFacade(notary.address, signer);

        const { proof, tx } = await notaryContractFacade.storeMeterReadings(readings);

        await tx.wait();

        return await this.commandBus.execute(new PersistProofCommand(deviceId, proof));
    }
}
