import { ContractTransaction, providers, Signer } from 'ethers';
import { IReadingsProof, PreciseProofUtils } from '../util/proof';

import { Notary as NotaryContract, Notary__factory } from '../typechain';
import { getEventsFromContract, IBlockchainEvent, Reading } from '../util';

export class NotaryContractFacade {
    public contract: NotaryContract;

    constructor(address: string, provider: providers.Provider | Signer) {
        this.contract = Notary__factory.connect(address, provider);
    }

    public async getMeterReadings(operator?: string): Promise<IBlockchainEvent[]> {
        return getEventsFromContract(
            this.contract,
            this.contract.filters.NewMeterReading(operator, null)
        );
    }

    public async storeMeterReadings(
        readings: Reading[]
    ): Promise<{
        proof: IReadingsProof;
        tx: ContractTransaction;
    }> {
        if (!this.contract.signer) {
            throw new Error(`Please attach a signer in order to publish transactions`);
        }

        if (readings.length < 1) {
            throw new Error(`Unable to write 0 readings to the blockchain`);
        }

        const proof = PreciseProofUtils.generateProofs(readings);

        return {
            proof,
            tx: await this.contract.store(proof.rootHash)
        };
    }
}
