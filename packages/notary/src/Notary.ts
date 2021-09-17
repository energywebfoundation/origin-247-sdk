import { ContractTransaction, providers } from 'ethers';
import { Notary as NotaryContract, Notary__factory } from './typechain';
import { getEventsFromContract, IBlockchainEvent } from './util';

export class Notary {
    public contract: NotaryContract;

    constructor(address: string, provider: providers.JsonRpcProvider) {
        this.contract = Notary__factory.connect(address, provider);
    }

    public async getMeterReadings(operator?: string): Promise<IBlockchainEvent[]> {
        return getEventsFromContract(
            this.contract,
            this.contract.filters.NewMeterReading(operator, null)
        );
    }

    public async storeMeterReading(proof: string): Promise<ContractTransaction> {
        return this.contract.store(proof);
    }
}
