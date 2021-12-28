import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';

import { MatchResultEntity } from './MatchResult.entity';
import { FindOptions, MatchResultRepository, NewMatchResult } from './MatchResult.repository';

@Injectable()
export class MatchResultInMemoryRepository implements MatchResultRepository {
    private db: MatchResultEntity[] = [];
    private id = 0;

    public async create(matchResult: NewMatchResult): Promise<MatchResultEntity> {
        this.id += 1;

        const entity = {
            ...matchResult,
            id: this.id,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.db.push(entity);

        return entity;
    }

    public async getAll(): Promise<MatchResultEntity[]> {
        return this.db;
    }

    public async find(findOptions: FindOptions): Promise<MatchResultEntity[]> {
        return this.db.filter((entry) => {
            const hasGeneratorId = findOptions.consumerIds.includes(entry.consumerId);
            const hasConsumerId = findOptions.generatorIds.includes(entry.generatorId);
            const hasTimestamp =
                entry.timestamp >= findOptions.from && entry.timestamp <= findOptions.to;

            return hasGeneratorId && hasConsumerId && hasTimestamp;
        });
    }
}
