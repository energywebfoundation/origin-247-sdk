import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';

import { ExcessGenerationEntity } from './ExcessGeneration.entity';
import {
    FindOptions,
    ExcessGenerationRepository,
    NewExcessGeneration
} from './ExcessGeneration.repository';

@Injectable()
export class ExcessGenerationPostgresRepository implements ExcessGenerationRepository {
    constructor(
        @InjectRepository(ExcessGenerationEntity)
        private repository: Repository<ExcessGenerationEntity>
    ) {}

    public async create(generation: NewExcessGeneration): Promise<ExcessGenerationEntity> {
        return await this.repository.save(generation);
    }

    public async getAll(): Promise<ExcessGenerationEntity[]> {
        return await this.repository.find();
    }

    public async find(findOptions: FindOptions): Promise<ExcessGenerationEntity[]> {
        return await this.repository.find({
            where: {
                generatorId: In(findOptions.generatorIds),
                timestamp: Between(findOptions.from, findOptions.to)
            }
        });
    }
}
