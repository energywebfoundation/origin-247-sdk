import {
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    UpdateDateColumn
} from 'typeorm';
import { IClaim } from '@energyweb/issuer';
import { ICertificateReadModel, IVolumeDistribution } from '../../../types';

export const tableName = 'certificate_read_model';

@Entity(tableName)
export class CertificateReadModelEntity implements ICertificateReadModel {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @Index()
    @Column({ nullable: false })
    internalCertificateId: number;

    @Column({ nullable: true })
    blockchainCertificateId: number | null;

    @Column()
    deviceId: string;

    @Column()
    generationStartTime: number;

    @Column()
    generationEndTime: number;

    @Column()
    creationTime: number;

    @Column({ type: 'simple-json' })
    owners: Record<string, string>;

    @Column({ type: 'simple-json' })
    claimers: Record<string, string> | null;

    @Column({ array: true, type: 'simple-json' })
    claims: IClaim[];

    @Column()
    creationBlockHash: string;

    @Column({ type: 'simple-json' })
    metadata: unknown;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
