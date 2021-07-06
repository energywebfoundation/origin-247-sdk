import { Injectable } from '@nestjs/common';
import { EnergyTransferRequest } from '../EnergyTransferRequest';
import {
    EnergyTransferRequestRepository,
    ICreateNewCommand,
    IUpdateWithCertificateIdCommand
} from './EnergyTransferRequest.repository';

@Injectable()
export class EnergyTransferRequestInMemoryRepository implements EnergyTransferRequestRepository {
    private serial: number = 0;
    private db: EnergyTransferRequest[] = [];

    public async createNew(command: ICreateNewCommand): Promise<EnergyTransferRequest> {
        const { buyerId, sellerId, volume, generatorId } = command;

        const entity = {
            id: this.serial++,
            createdAt: new Date(),
            updatedAt: new Date(),
            buyerId,
            sellerId,
            volume,
            generatorId,
            certificateId: null,
            isCertificatePersisted: false
        } as EnergyTransferRequest;

        this.db.push(entity);

        return entity;
    }

    public async updateWithCertificateId(command: IUpdateWithCertificateIdCommand): Promise<void> {
        const request = this.db.find((e) => e.id === command.requestId)!;

        request.certificateId = command.certificateId;
    }

    public async updateWithPersistedCertificate(requestId: number): Promise<void> {
        const request = this.db.find((e) => e.id === requestId)!;

        request.isCertificatePersisted = true;
    }

    public async findByCertificateId(certificateId: number): Promise<EnergyTransferRequest | null> {
        const request = this.db.find((e) => e.certificateId === certificateId);

        return request ?? null;
    }
}
