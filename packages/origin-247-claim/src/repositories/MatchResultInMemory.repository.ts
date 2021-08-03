import { Injectable } from '@nestjs/common';

import { MatchResultEntity } from './MatchResult.entity';
import { FindOptions, MatchResultRepository, NewMatchResult } from './MatchResult.repository';

@Injectable()
export class MatchResultInMemoryRepository implements MatchResultRepository {
    private serial: number = 0;
    private db: MatchResultEntity[] = [];

    public async create(matchResult: NewMatchResult): Promise<MatchResultEntity> {
        const toCreate = {
            id: this.serial++,
            ...matchResult,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.db.push(toCreate);
        return toCreate;
    }

    public getAll(): Promise<MatchResultEntity[]> {
        return new Promise((resolve, reject) => {
            resolve(this.db);
        });
    }

    public async find(findOptions?: FindOptions): Promise<MatchResultEntity[]> {
        if (!findOptions) {
            return this.db;
        }
        const found = this.db.filter((record) => {
            if (
                findOptions.firstEntityId &&
                !findOptions.firstEntityId.includes(record.firstEntityId)
            ) {
                return false;
            }
            if (
                findOptions.secondEntityId &&
                !findOptions.secondEntityId.includes(record.secondEntityId)
            ) {
                return false;
            }
            if (findOptions.from && record.from < findOptions.from) {
                return false;
            }
            if (findOptions.to && record.to > findOptions.to) {
                return false;
            }
            return true;
        });
        return found;
    }

    public async deleteAll() {
        this.db = [];
    }
}
