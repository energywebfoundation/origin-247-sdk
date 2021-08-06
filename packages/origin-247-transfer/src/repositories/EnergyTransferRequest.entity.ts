import {
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Column
} from 'typeorm';
import {
    CertificateData,
    EnergyTransferRequestAttrs,
    State,
    TransferValidationStatus
} from '../EnergyTransferRequest';

export const tableName = 'energy_transfer_request_v2';

@Entity(tableName)
export class EnergyTransferRequestEntity implements EnergyTransferRequestAttrs {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column({ type: 'timestamptz' })
    transferDate: Date;

    @Column({ type: 'text' })
    sellerAddress: string;

    @Column({ type: 'text' })
    buyerAddress: string;

    @Column({ type: 'text' })
    volume: string;

    @Column({ type: 'int4', nullable: true, unique: true })
    certificateId: number | null;

    @Column('simple-json')
    validationStatusRecord: Record<string, TransferValidationStatus>;

    @Column({ type: 'text', nullable: true })
    processError: string | null;

    @Column({ type: 'text', nullable: true })
    state: State;

    @Column({ type: 'simple-json' })
    certificateData: CertificateData;
}
