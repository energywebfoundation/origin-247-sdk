import { EnergyTransferRequest } from '../EnergyTransferRequest';

export interface ICreateNewCommand {
    buyerId: string;
    sellerId: string;
    volume: string;
    generatorId: string;
}

export interface IUpdateWithCertificateIdCommand {
    requestId: number;
    certificateId: number;
}

export const ENERGY_TRANSFER_REQUEST_REPOSITORY = Symbol.for('ENERGY_TRANSFER_REQUEST_REPOSITORY');

export interface EnergyTransferRequestRepository {
    createNew(command: ICreateNewCommand): Promise<EnergyTransferRequest>;
    updateWithCertificateId(command: IUpdateWithCertificateIdCommand): Promise<void>;
    updateWithPersistedCertificate(requestId: number): Promise<void>;
    findByCertificateId(certificateId: number): Promise<EnergyTransferRequest | null>;
}
