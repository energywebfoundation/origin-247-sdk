import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection, Between, In, createQueryBuilder } from 'typeorm';

import { MatchResultEntity, tableName } from './MatchResult.entity';
import { FindOptions, MatchResultRepository, NewMatchResult } from './MatchResult.repository';

enum Entity {
    FirstEntity = 'firstEntityId',
    SecondEntity = 'secondEntityId'
}

enum Column {
    FirstEntityId = 'firstEntityId',
    SecondEntityId = 'secondEntityId',
    From = 'from',
    To = 'to'
}

interface GroupedMatchResults {
    firstEntityId?: string;
    secondEntityId?: string;
    array_agg: MatchResultEntity[];
}

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
                firstEntityId: In(findOptions.firstEntityId),
                secondEntityId: In(findOptions.secondEntityId),
                from: Between(findOptions.from, findOptions.to),
                to: Between(findOptions.from, findOptions.to)
            }
        });
    }

    public async findGrouped(
        findOptions: FindOptions,
        groupOptions: Entity[]
    ): Promise<GroupedMatchResults[]> {
        if (!groupOptions.length) {
            throw new Error('At least one group option must be provided.');
        }

        const sanitized = this.sanitizeInput(groupOptions);
        const queryRunner = this.connection.createQueryRunner();
        const matchResultQuery = this.connection
            .createQueryBuilder()
            .select(sanitized)
            .addSelect(this.createJSONFromRow())
            .from(tableName, tableName)
            .groupBy(sanitized.join(', '))
            .getQueryAndParameters();

        const res = await queryRunner.query(matchResultQuery[0]);
        console.log(JSON.stringify(res, null, 2));
        // return JSON.parse(res);
        return res;
    }

    private sanitizeInput(input: string[]): string[] {
        return input.map((i) => `"${i}"`);
    }

    private createJSONFromRow(): string {
        const toJSON = `array_agg(row_to_json(${tableName}))`;
        // const toJSON = `array_agg(jsonb_build_object('volume', volume, 'from', "from", 'to', "to", 'firstEntityMetaData', "firstEntityMetaData", 'secondEntityMetaData', "secondEntityMetaData"))`;
        return toJSON;
    }
}
