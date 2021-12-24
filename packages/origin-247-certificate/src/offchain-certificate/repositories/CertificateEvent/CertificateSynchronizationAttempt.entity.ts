import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CertificateEventType } from '../../events/Certificate.events';

export const tableName = 'certificate_synchronization_attempt';

@Entity(tableName)
export class CertificateSynchronizationAttemptEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @Column()
    internalCertificateId: number;

    @Column({ enum: CertificateEventType })
    type: CertificateEventType;

    @Column({ name: 'attempts_count' })
    attemptsCount: number;

    @Column()
    synchronized: boolean;

    @Column({ name: 'has_error' })
    hasError: boolean;
}
