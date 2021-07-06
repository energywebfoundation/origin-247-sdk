import { Injectable } from '@nestjs/common';
import { EnergyTransferBlock } from '../EnergyTransferBlock';
import {
    EnergyTransferBlockRepository,
    ICreateNewCommand,
    IUpdateWithCertificateIdCommand
} from './EnergyTransferBlock.repository';

@Injectable()
export class EnergyTransferBlockInMemoryRepository implements EnergyTransferBlockRepository {
    private serial: number = 0;
    private db: EnergyTransferBlock[] = [];

    public async createNew(command: ICreateNewCommand): Promise<EnergyTransferBlock> {
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
        } as EnergyTransferBlock;

        this.db.push(entity);

        return entity;
    }

    public async updateWithCertificateId(command: IUpdateWithCertificateIdCommand): Promise<void> {
        const block = this.db.find((e) => e.id === command.blockId)!;

        block.certificateId = command.certificateId;
    }
}
