import {
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Column
} from 'typeorm';

export const tableName = 'match_leftover_consumption';

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
    timestamp: Date;

    @Column({ type: 'simple-json' })
    consumerMetadata: unknown;
}
