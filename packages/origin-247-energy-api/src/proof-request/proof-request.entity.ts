import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Reading } from '../util';

export const proofRequestTableName = 'notary_proof_request';

@Entity({ name: proofRequestTableName })
export class ProofRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    deviceId: string;

    @Column('simple-json')
    reading: Reading;

    @Column()
    state: ProofRequestState;

    @Column({ nullable: true, type: 'text' })
    processError: string | null;
}

export enum ProofRequestState {
    Pending = 'pending',
    Processing = 'processing',
    Processed = 'processed',
    ProcessingError = 'processingError'
}
