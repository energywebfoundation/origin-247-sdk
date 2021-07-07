import { EnergyTransferRequest } from '../EnergyTransferRequest';

export interface ICreateNewCommand {
    buyerId: string;
    sellerId: string;
    volume: string;
    generatorId: string;
}

export const ENERGY_TRANSFER_REQUEST_REPOSITORY = Symbol.for('ENERGY_TRANSFER_REQUEST_REPOSITORY');

export interface EnergyTransferRequestRepository {
    createNew(command: ICreateNewCommand): Promise<EnergyTransferRequest>;
    findByCertificateId(certificateId: number): Promise<EnergyTransferRequest | null>;
    save(entity: EnergyTransferRequest): Promise<void>;
}
