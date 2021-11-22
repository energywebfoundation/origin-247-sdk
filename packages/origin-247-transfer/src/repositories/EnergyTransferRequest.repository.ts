import { EnergyTransferRequest, NewAttributesParams, State } from '../EnergyTransferRequest';

export const ENERGY_TRANSFER_REQUEST_REPOSITORY = Symbol.for('ENERGY_TRANSFER_REQUEST_REPOSITORY');

export interface EnergyTransferRequestRepository {
    createNew(command: NewAttributesParams): Promise<EnergyTransferRequest>;
    findByCertificateId(certificateId: number): Promise<EnergyTransferRequest | null>;
    findById(id: number): Promise<EnergyTransferRequest | null>;
    findAll(): Promise<EnergyTransferRequest[]>;
    findByState(status: State, limit: number): Promise<EnergyTransferRequest[]>;
    save(entity: EnergyTransferRequest): Promise<void>;
    saveManyInTransaction(entity: EnergyTransferRequest[]): Promise<void>;
    updateWithLock(id: number, cb: (entity: EnergyTransferRequest) => void): Promise<void>;
}
