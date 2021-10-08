import { PreciseProofs } from 'precise-proofs-js';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Reading } from '~/util';

@Entity()
export class NotaryProof {
    @Column()
    deviceId: string;

    @Column('simple-json')
    readings: Reading[];

    @PrimaryColumn()
    rootHash: string;

    @Column('simple-json')
    leafs: PreciseProofs.Leaf[];

    @Column('simple-array')
    salts: string[];
}
