import {
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Column
} from 'typeorm';
import { EnergyTransferRequestAttrs, TransferValidationStatus } from '../EnergyTransferRequest';

export const tableName = 'energy_transfer_request';

@Entity(tableName)
export class EnergyTransferRequestEntity implements EnergyTransferRequestAttrs {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'timestamp' })
    transferDate: Date;

    @Column({ type: 'text' })
    sellerAddress: string;

    @Column({ type: 'text' })
    buyerAddress: string;

    @Column({ type: 'text' })
    generatorId: string;

    @Column({ type: 'text' })
    volume: string;

    @Column({ type: 'int4', nullable: true, unique: true })
    certificateId: number | null;

    @Column({ type: 'boolean' })
    isCertificatePersisted: boolean;

    @Column('simple-json')
    validationStatusRecord: Record<string, TransferValidationStatus>;

    @Column({ type: 'text' })
    computedValidationStatus: TransferValidationStatus;
}
