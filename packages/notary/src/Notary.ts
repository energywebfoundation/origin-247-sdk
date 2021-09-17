import { ContractTransaction, providers, Signer } from 'ethers';
import { PreciseProofUtils } from './proof';

import { Notary as NotaryContract, Notary__factory } from './typechain';
import { getEventsFromContract, IBlockchainEvent, Reading } from './util';

export class Notary {
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
        readings: Reading[],
        salts?: string[]
    ): Promise<ContractTransaction> {
        if (!this.contract.signer) {
            throw new Error(`Please attach a signer in order to publish transactions`);
        }

        if (readings.length < 1) {
            throw new Error(`Unable to write 0 readings to the blockchain`);
        }

        const proof = PreciseProofUtils.generateProofs(readings, salts);

        // TO-DO: Store this proof somewhere

        return this.contract.store(proof.rootHash);
    }
}
