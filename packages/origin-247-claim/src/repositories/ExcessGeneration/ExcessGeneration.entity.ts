import {
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Column
} from 'typeorm';

export const tableName = 'excess_generation';

@Entity(tableName)
export class ExcessGenerationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @Column({ type: 'text' })
    generatorId: string;

    @Column({ type: 'text' })
    volume: string; //BigNumber

    @Column({ type: 'timestamptz' })
    from: Date;

    @Column({ type: 'timestamptz' })
    to: Date;

    @Column({ type: 'simple-json' })
    generatorMetadata: any;
}
