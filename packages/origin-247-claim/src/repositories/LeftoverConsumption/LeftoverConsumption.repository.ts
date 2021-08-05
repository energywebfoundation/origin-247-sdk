import { LeftoverConsumptionEntity } from './LeftoverConsumption.entity';

export const LEFTOVER_CONSUMPTION_REPOSITORY = Symbol.for('LEFTOVER_CONSUMPTION_REPOSITORY');

export interface FindOptions {
    consumerIds: string[];
    from: Date;
    to: Date;
}

export enum LeftoverConsumptionColumns {
    Id = 'id',
    ConsumerId = 'consumerId',
    Timestamp = 'timestamp',
    ConsumerMetadata = 'consumerMetadata',
    Volume = 'volume',
    CreatedAt = 'createdAt',
    UpdatedAt = 'updatedAt'
}

export type NewLeftoverConsumption = Omit<
    LeftoverConsumptionEntity,
    'id' | 'createdAt' | 'updatedAt'
>;

export interface LeftoverConsumptionRepository {
    create(matchResult: NewLeftoverConsumption): Promise<LeftoverConsumptionEntity>;
    getAll(): Promise<LeftoverConsumptionEntity[]>;
    find(findOptions: FindOptions): Promise<LeftoverConsumptionEntity[]>;
}
