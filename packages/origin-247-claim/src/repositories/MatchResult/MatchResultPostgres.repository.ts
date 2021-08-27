import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';

import { MatchResultEntity } from './MatchResult.entity';
import { FindOptions, MatchResultRepository, NewMatchResult } from './MatchResult.repository';

@Injectable()
export class MatchResultPostgresRepository implements MatchResultRepository {
    constructor(
        @InjectRepository(MatchResultEntity)
        private repository: Repository<MatchResultEntity>
    ) {}

    public async create(matchResult: NewMatchResult): Promise<MatchResultEntity> {
        return await this.repository.save(matchResult);
    }

    public async getAll(): Promise<MatchResultEntity[]> {
        return await this.repository.find();
    }

    public async find(findOptions: FindOptions): Promise<MatchResultEntity[]> {
        return await this.repository.find({
            where: {
                consumerId: In(findOptions.consumerIds),
                generatorId: In(findOptions.generatorIds),
                timestamp: Between(findOptions.from, findOptions.to)
            }
        });
    }
}
