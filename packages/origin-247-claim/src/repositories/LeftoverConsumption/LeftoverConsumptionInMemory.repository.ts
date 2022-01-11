import { Injectable } from '@nestjs/common';

import { LeftoverConsumptionEntity } from './LeftoverConsumption.entity';
import {
    FindOptions,
    LeftoverConsumptionRepository,
    NewLeftoverConsumption
} from './LeftoverConsumption.repository';

@Injectable()
export class LeftoverConsumptionInMemoryRepository implements LeftoverConsumptionRepository {
    private db: LeftoverConsumptionEntity[] = [];
    private id = 0;

    public async create(leftover: NewLeftoverConsumption): Promise<LeftoverConsumptionEntity> {
        this.id += 1;

        const entity = {
            ...leftover,
            id: this.id,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.db.push(entity);

        return entity;
    }

    public async getAll(): Promise<LeftoverConsumptionEntity[]> {
        return this.db;
    }

    public async find(findOptions: FindOptions): Promise<LeftoverConsumptionEntity[]> {
        return this.db.filter((entry) => {
            const hasGeneratorId = findOptions.consumerIds.includes(entry.consumerId);
            const hasTimestamp =
                entry.timestamp >= findOptions.from && entry.timestamp <= findOptions.to;

            return hasGeneratorId && hasTimestamp;
        });
    }
}
