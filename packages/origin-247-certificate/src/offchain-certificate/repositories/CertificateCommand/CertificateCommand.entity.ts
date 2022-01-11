import { CreateDateColumn, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IIssueCommand, ITransferCommand, IClaimCommand } from '../../../types';
import { IClaimPersistedCommand } from '../../types';

export const tableName = 'certificate_command';

@Entity(tableName)
export class CertificateCommandEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @Column({ type: 'simple-json' })
    payload: unknown; // each command has different type and we save this using generic `persistError` message
}
