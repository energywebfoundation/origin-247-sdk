import { CreateDateColumn, Entity, Column, Index, UpdateDateColumn, PrimaryColumn } from 'typeorm';
import { IClaim } from '@energyweb/issuer';
import { ICertificateReadModel } from '../../../types';
import { bigintTransformer } from '../utils';

export const tableName = 'certificate_read_model';

@Entity(tableName)
export class CertificateReadModelEntity implements ICertificateReadModel {
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @Index()
    @PrimaryColumn({ nullable: false, unique: true })
    internalCertificateId: number;

    @Column({ nullable: true, type: Number })
    blockchainCertificateId: number | null;

    @Column()
    deviceId: string;

    @Column({ type: 'bigint', transformer: bigintTransformer })
    generationStartTime: number;

    @Column({ type: 'bigint', transformer: bigintTransformer })
    generationEndTime: number;

    @Column({ type: 'bigint', transformer: bigintTransformer })
    creationTime: number;

    @Column({ type: 'simple-json' })
    owners: Record<string, string>;

    @Column({ type: 'simple-json' })
    claimers: Record<string, string> | null;

    @Column('simple-json')
    claims: IClaim[];

    @Column()
    creationBlockHash: string;

    @Column({ type: 'simple-json', nullable: true })
    metadata: any;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
