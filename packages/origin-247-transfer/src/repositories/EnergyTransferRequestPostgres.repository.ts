import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Repository,
    UpdateDateColumn,
    Column
} from 'typeorm';
import { EnergyTransferRequest } from '../EnergyTransferRequest';
import {
    ICreateNewCommand,
    EnergyTransferRequestRepository,
    IUpdateWithCertificateIdCommand
} from './EnergyTransferRequest.repository';

@Entity()
export class EnergyTransferRequestEntity implements EnergyTransferRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'text' })
    sellerId: string;

    @Column({ type: 'text' })
    buyerId: string;

    @Column({ type: 'text' })
    generatorId: string;

    @Column({ type: 'text' })
    volume: string;

    @Column({ type: 'int4', nullable: true })
    certificateId: number | null;

    @Column({ type: 'boolean' })
    isCertificatePersisted: boolean;
}

@Injectable()
export class EnergyTransferRequestPostgresRepository implements EnergyTransferRequestRepository {
    constructor(
        @InjectRepository(EnergyTransferRequestEntity)
        private repository: Repository<EnergyTransferRequestEntity>
    ) {}

    public async createNew(command: ICreateNewCommand): Promise<EnergyTransferRequest> {
        const { buyerId, sellerId, volume, generatorId } = command;

        const entity = await this.repository.create({
            buyerId,
            sellerId,
            volume,
            generatorId,
            certificateId: null,
            isCertificatePersisted: false
        });

        return await this.repository.save(entity);
    }

    public async updateWithCertificateId(command: IUpdateWithCertificateIdCommand): Promise<void> {
        await this.repository.update(
            { id: command.requestId },
            { certificateId: command.certificateId }
        );
    }
}
