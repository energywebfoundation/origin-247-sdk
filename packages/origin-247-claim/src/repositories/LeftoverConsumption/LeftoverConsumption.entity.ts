import {
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Column
} from 'typeorm';

export const tableName = 'leftover_consumption';

@Entity(tableName)
export class LeftoverConsumptionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column({ type: 'text' })
    consumerId: string;

    @Column({ type: 'text' })
    volume: string; //BigNumber

    @Column({ type: 'timestamptz' })
    from: Date;

    @Column({ type: 'timestamptz' })
    to: Date;

    @Column({ type: 'simple-json' })
    consumerMetadata: any;
}
