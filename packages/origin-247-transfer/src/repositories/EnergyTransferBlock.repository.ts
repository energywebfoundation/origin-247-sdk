import { EnergyTransferBlock } from '../EnergyTransferBlock';

export interface ICreateNewCommand {
    buyerId: string;
    sellerId: string;
    volume: string;
    generatorId: string;
}

export interface IUpdateWithCertificateIdCommand {
    blockId: number;
    certificateId: number;
}

export const ENERGY_TRANSFER_BLOCK_REPOSITORY = Symbol.for('ENERGY_TRANSFER_BLOCK_REPOSITORY');

export interface EnergyTransferBlockRepository {
    createNew(command: ICreateNewCommand): Promise<EnergyTransferBlock>;
    updateWithCertificateId(command: IUpdateWithCertificateIdCommand): Promise<void>;
}
