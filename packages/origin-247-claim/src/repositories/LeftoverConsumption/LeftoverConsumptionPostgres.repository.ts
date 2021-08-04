import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';

import { LeftoverConsumptionEntity } from './LeftoverConsumption.entity';
import {
    FindOptions,
    LeftoverConsumptionRepository,
    NewLeftoverConsumption
} from './LeftoverConsumption.repository';

@Injectable()
export class LeftoverConsumptionPostgresRepository implements LeftoverConsumptionRepository {
    constructor(
        @InjectRepository(LeftoverConsumptionEntity)
        private repository: Repository<LeftoverConsumptionEntity>
    ) {}

    public async create(leftover: NewLeftoverConsumption): Promise<LeftoverConsumptionEntity> {
        return await this.repository.save(leftover);
    }

    public async getAll(): Promise<LeftoverConsumptionEntity[]> {
        return await this.repository.find();
    }

    public async find(findOptions: FindOptions): Promise<LeftoverConsumptionEntity[]> {
        return await this.repository.find({
            where: {
                consumerId: In(findOptions.consumerIds),
                from: Between(findOptions.from, findOptions.to),
                to: Between(findOptions.from, findOptions.to)
            }
        });
    }
}
