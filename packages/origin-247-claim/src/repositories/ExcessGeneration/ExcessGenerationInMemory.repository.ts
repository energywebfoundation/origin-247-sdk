import { Injectable } from '@nestjs/common';

import { ExcessGenerationEntity } from './ExcessGeneration.entity';
import {
    FindOptions,
    ExcessGenerationRepository,
    NewExcessGeneration
} from './ExcessGeneration.repository';

@Injectable()
export class ExcessGenerationInMemoryRepository implements ExcessGenerationRepository {
    private id = 0;
    private db: ExcessGenerationEntity[] = [];

    public async create(generation: NewExcessGeneration): Promise<ExcessGenerationEntity> {
        this.id += 1;

        const entity: ExcessGenerationEntity = {
            ...generation,
            id: this.id,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.db.push(entity);

        return entity;
    }

    public async getAll(): Promise<ExcessGenerationEntity[]> {
        return await this.db;
    }

    public async find(findOptions: FindOptions): Promise<ExcessGenerationEntity[]> {
        return this.db.filter((entry) => {
            const hasGeneratorId = findOptions.generatorIds.includes(entry.generatorId);
            const hasTimestamp =
                entry.timestamp >= findOptions.from && entry.timestamp <= findOptions.to;

            return hasGeneratorId && hasTimestamp;
        });
    }
}
