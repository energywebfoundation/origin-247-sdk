import { PreciseProofs } from 'precise-proofs-js';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Reading } from '~/util';

@Entity()
export class NotaryProof {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    deviceId: string;

    @Column('simple-json')
    readings: Reading[];

    @Column()
    rootHash: string;

    @Column('simple-json')
    leafs: PreciseProofs.Leaf[];

    @Column('simple-array')
    salts: string[];
}
