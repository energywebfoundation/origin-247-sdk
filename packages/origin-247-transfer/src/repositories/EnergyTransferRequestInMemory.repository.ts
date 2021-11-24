import { Injectable } from '@nestjs/common';
import { EnergyTransferRequest, NewAttributesParams, State } from '../EnergyTransferRequest';
import {
    EnergyTransferRequestRepository,
    IFindByStateOptions
} from './EnergyTransferRequest.repository';

@Injectable()
export class EnergyTransferRequestInMemoryRepository implements EnergyTransferRequestRepository {
    private serial: number = 1;
    private db: EnergyTransferRequest[] = [];

    public async createNew(command: NewAttributesParams): Promise<EnergyTransferRequest> {
        const entity: EnergyTransferRequest = EnergyTransferRequest.fromAttrs({
            ...EnergyTransferRequest.newAttributes(command),
            id: this.serial++
        });

        this.db.push(entity);

        return entity;
    }

    public async save(entity: EnergyTransferRequest): Promise<void> {
        // changing entity changes original object in memory, so no point in saving
    }

    public async saveManyInTransaction(entity: EnergyTransferRequest[]): Promise<void> {
        // changing entity changes original object in memory, so no point in saving
    }

    public async findAll(): Promise<EnergyTransferRequest[]> {
        return this.db.slice();
    }

    public async findByCertificateId(certificateId: number): Promise<EnergyTransferRequest | null> {
        const request = this.db.find((e) => e.certificateId === certificateId);

        return request ?? null;
    }

    public async findByState(
        state: State,
        options: IFindByStateOptions
    ): Promise<EnergyTransferRequest[]> {
        return this.db.filter((e) => e.toAttrs().state === state).slice(0, options.limit);
    }

    public async findById(id: number): Promise<EnergyTransferRequest | null> {
        const request = this.db.find((e) => e.id === id);

        return request ?? null;
    }

    public async updateWithLock(
        id: number,
        cb: (entity: EnergyTransferRequest) => void
    ): Promise<void> {
        const request = this.db.find((e) => e.id === id);

        if (!request) {
            return;
        }

        cb(request);
    }
}
