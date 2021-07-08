import { Injectable } from '@nestjs/common';
import { EnergyTransferRequest } from '../EnergyTransferRequest';
import {
    EnergyTransferRequestRepository,
    ICreateNewCommand
} from './EnergyTransferRequest.repository';

@Injectable()
export class EnergyTransferRequestInMemoryRepository implements EnergyTransferRequestRepository {
    private serial: number = 0;
    private db: EnergyTransferRequest[] = [];

    public async createNew(command: ICreateNewCommand): Promise<EnergyTransferRequest> {
        const { buyerId, sellerId, volume, generatorId, sellerAddress, buyerAddress } = command;

        const entity: EnergyTransferRequest = EnergyTransferRequest.fromAttrs({
            ...EnergyTransferRequest.newAttributes({
                buyerId,
                buyerAddress,
                sellerId,
                sellerAddress,
                volume,
                generatorId
            }),
            id: this.serial++
        });

        this.db.push(entity);

        return entity;
    }

    public async save(entity: EnergyTransferRequest): Promise<void> {
        // changing entity changes original object in memory, so no point in saving
    }

    public async findByCertificateId(certificateId: number): Promise<EnergyTransferRequest | null> {
        const request = this.db.find((e) => e.certificateId === certificateId);

        return request ?? null;
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
