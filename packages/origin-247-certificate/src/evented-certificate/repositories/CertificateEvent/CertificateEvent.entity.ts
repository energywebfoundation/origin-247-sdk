import { CreateDateColumn, Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { IIssueCommand, ITransferCommand, IClaimCommand } from '../../../types';
import { CertificateEventType } from '../../events/Certificate.events';

export const tableName = 'certificate_event';

@Entity(tableName)
export class CertificateEventEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: false })
    internalCertificateId: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @Column({ nullable: false })
    commandId: number;

    @Column({ enum: CertificateEventType })
    type: CertificateEventType;

    @Column()
    version: number;

    @Column({ type: 'simple-json' })
    payload: IIssueCommand<unknown> | ITransferCommand | IClaimCommand;
}
