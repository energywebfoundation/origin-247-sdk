import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CertificateCommandEntity } from './CertificateCommand.entity';
import {
    CertificateCommandRepository,
    NewCertificateCommand
} from './CertificateCommand.repository';

@Injectable()
export class CertificateCommandPostgresRepository implements CertificateCommandRepository {
    constructor(
        @InjectRepository(CertificateCommandEntity)
        private repository: Repository<CertificateCommandEntity>
    ) {}

    public async save(command: NewCertificateCommand): Promise<CertificateCommandEntity> {
        return await this.repository.save(command);
    }

    public async saveMany(commands: NewCertificateCommand[]): Promise<CertificateCommandEntity[]> {
        return await this.repository.save(commands);
    }

    public async getAll(): Promise<CertificateCommandEntity[]> {
        return await this.repository.find();
    }

    public async getById(commandId: number): Promise<CertificateCommandEntity | null> {
        const found = await this.repository.findOne({
            where: {
                id: commandId
            }
        });
        return found ?? null;
    }
}
