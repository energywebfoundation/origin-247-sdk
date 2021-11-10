import { CreateDateColumn, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IIssueCommand, ITransferCommand, IClaimCommand } from '../../../types';

export const tableName = 'certificate_command';

@Entity(tableName)
export class CertificateCommandEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @Column({ type: 'simple-json' })
    payload: IIssueCommand<unknown> | ITransferCommand | IClaimCommand;
}
