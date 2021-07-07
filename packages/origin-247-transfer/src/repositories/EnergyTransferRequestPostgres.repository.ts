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
import {
    EnergyTransferRequest,
    EnergyTransferRequestAttrs,
    TransferValidationStatus
} from '../EnergyTransferRequest';
import {
    ICreateNewCommand,
    EnergyTransferRequestRepository
} from './EnergyTransferRequest.repository';

@Entity()
export class EnergyTransferRequestEntity implements EnergyTransferRequestAttrs {
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

    @Column({ type: 'int4', nullable: true, unique: true })
    certificateId: number | null;

    @Column({ type: 'boolean' })
    isCertificatePersisted: boolean;

    @Column('simple-json')
    validationStatus: Record<string, TransferValidationStatus>;
}

@Injectable()
export class EnergyTransferRequestPostgresRepository implements EnergyTransferRequestRepository {
    constructor(
        @InjectRepository(EnergyTransferRequestEntity)
        private repository: Repository<EnergyTransferRequestEntity>
    ) {}

    public async save(entity: EnergyTransferRequest): Promise<void> {
        await this.repository.update({ id: entity.id }, entity.toAttrs());
    }

    public async createNew(command: ICreateNewCommand): Promise<EnergyTransferRequest> {
        const { buyerId, sellerId, volume, generatorId } = command;

        const entity = this.repository.create({
            buyerId,
            sellerId,
            volume,
            generatorId,
            certificateId: null,
            isCertificatePersisted: false,
            validationStatus: {}
        });

        const savedEntity = await this.repository.save(entity);

        return EnergyTransferRequest.fromAttrs(savedEntity);
    }

    public async findByCertificateId(certificateId: number): Promise<EnergyTransferRequest | null> {
        const request = await this.repository.findOne({ certificateId });

        return request ? EnergyTransferRequest.fromAttrs(request) : null;
    }
}
