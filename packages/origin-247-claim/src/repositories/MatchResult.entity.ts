import {
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Column
} from 'typeorm';

export const tableName = 'match_result';

@Entity(tableName)
export class MatchResultEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    // in case of generalized entities, it will be the user's responsibility
    // to make sure that those ids always refer to the same entities
    // otherwise, with different contexts, the data will be invalid
    @Column({ type: 'text' })
    firstEntityId: string;

    @Column({ type: 'text' })
    secondEntityId: string;

    @Column({ type: 'text' })
    volume: string; //BigNumber

    @Column({ type: 'timestamptz' })
    from: Date;

    @Column({ type: 'timestamptz' })
    to: Date;

    @Column({ type: 'simple-json' })
    firstEntityMetaData: any;

    @Column({ type: 'simple-json' })
    secondEntityMetaData: any;
}
