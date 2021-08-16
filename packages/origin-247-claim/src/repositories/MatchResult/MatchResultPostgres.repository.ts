import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection, Between, In, createQueryBuilder } from 'typeorm';

import { MatchResultEntity, tableName } from './MatchResult.entity';
import {
    FindOptions,
    MatchResultRepository,
    NewMatchResult,
    GroupEntity,
    MatchResultColumns,
    GroupedMatchResults
} from './MatchResult.repository';

@Injectable()
export class MatchResultPostgresRepository implements MatchResultRepository {
    constructor(
        @InjectRepository(MatchResultEntity)
        private repository: Repository<MatchResultEntity>,
        @InjectConnection()
        private connection: Connection
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

    public async findGrouped(
        findOptions: FindOptions,
        groupOptions: [GroupEntity] | [GroupEntity, GroupEntity]
    ): Promise<GroupedMatchResults[]> {
        const sanitized = this.sanitizeInput(groupOptions);
        const queryRunner = this.connection.createQueryRunner();
        const matchResultQuery = this.connection
            .createQueryBuilder()
            .select(sanitized)
            .addSelect(`array_agg(row_to_json(${tableName})) as entries`)
            .from(tableName, tableName)
            .where(
                `"${MatchResultColumns.ConsumerId}" IN (${this.sanitizeInput(
                    findOptions.consumerIds,
                    "'"
                ).join(', ')})`
            )
            .andWhere(
                `"${MatchResultColumns.GeneratorId}" IN (${this.sanitizeInput(
                    findOptions.generatorIds,
                    "'"
                ).join(', ')})`
            )
            .andWhere(`"${MatchResultColumns.Timestamp}" between :dateFrom and :dateTo`, {
                dateFrom: findOptions.from,
                dateTo: findOptions.to
            })
            .groupBy(sanitized.join(', '))
            .getQueryAndParameters();

        const res = await queryRunner.query(matchResultQuery[0], matchResultQuery[1]);
        return res;
    }

    private sanitizeInput(input: string[], token?: string): string[] {
        const sanitizationToken = token ?? `"`;
        return input.map((i) => `${sanitizationToken}${i}${sanitizationToken}`);
    }
}
