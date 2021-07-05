import { Injectable } from '@nestjs/common';
import { EnergyTransferBlock } from '../EnergyTransferBlock';
import { EnergyTransferBlockRepository } from './EnergyTransferBlock.repository';

interface ICreateNewCommand {
    buyerId: string;
    sellerId: string;
    volume: string;
    certificateId: number;
}

@Injectable()
export class EnergyTransferBlockInMemoryRepository implements EnergyTransferBlockRepository {
    private serial: number = 0;
    private db: EnergyTransferBlock[] = [];

    public async createNew(command: ICreateNewCommand): Promise<EnergyTransferBlock> {
        const { buyerId, sellerId, volume, certificateId } = command;

        const entity = {
            id: this.serial++,
            createdAt: new Date(),
            updatedAt: new Date(),
            buyerId,
            sellerId,
            volume,
            certificateId,
            isCertificatePersisted: false
        } as EnergyTransferBlock;

        this.db.push(entity);

        return entity;
    }
}
