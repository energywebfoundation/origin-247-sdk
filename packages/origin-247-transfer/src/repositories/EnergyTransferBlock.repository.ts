import { EnergyTransferBlock } from '../EnergyTransferBlock';

export interface ICreateNewCommand {
    buyerId: string;
    sellerId: string;
    volume: string;
    certificateId: number;
}

export const ENERGY_TRANSFER_BLOCK_REPOSITORY = Symbol.for('ENERGY_TRANSFER_BLOCK_REPOSITORY');

export interface EnergyTransferBlockRepository {
    createNew(command: ICreateNewCommand): Promise<EnergyTransferBlock>;
}
