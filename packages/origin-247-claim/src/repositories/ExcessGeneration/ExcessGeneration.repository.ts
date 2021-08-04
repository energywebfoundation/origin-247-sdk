import { ExcessGenerationEntity } from './ExcessGeneration.entity';

export const EXCESS_GENERATION_REPOSITORY = Symbol.for('EXCESS_GENERATION_REPOSITORY');

export interface FindOptions {
    generatorIds: string[];
    from: Date;
    to: Date;
}

export enum ExcessGenerationColumns {
    Id = 'id',
    GeneratorId = 'generatorId',
    DateFrom = 'from',
    DateTo = 'to',
    GeneratorMetadata = 'generatorMetadata',
    Volume = 'volume',
    CreatedAt = 'createdAt',
    UpdatedAt = 'updatedAt'
}

export type NewExcessGeneration = Omit<ExcessGenerationEntity, 'id' | 'createdAt' | 'updatedAt'>;

export interface ExcessGenerationRepository {
    create(matchResult: NewExcessGeneration): Promise<ExcessGenerationEntity>;
    getAll(): Promise<ExcessGenerationEntity[]>;
    find(findOptions: FindOptions): Promise<ExcessGenerationEntity[]>;
}
