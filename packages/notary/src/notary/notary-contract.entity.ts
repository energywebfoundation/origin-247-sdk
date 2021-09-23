import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class NotaryContract {
    @PrimaryColumn()
    address: string;

    @Column()
    networkId: number;

    @Column()
    deployerPrivateKey: string;

    @Column()
    rpcNode: string;
}
