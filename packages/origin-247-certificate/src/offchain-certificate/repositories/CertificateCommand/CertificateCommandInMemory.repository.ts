import { Injectable } from '@nestjs/common';

import { CertificateCommandEntity } from './CertificateCommand.entity';
import {
    CertificateCommandRepository,
    NewCertificateCommand
} from './CertificateCommand.repository';

@Injectable()
export class CertificateCommandInMemoryRepository implements CertificateCommandRepository {
    private db: CertificateCommandEntity[] = [];

    public async save(generation: NewCertificateCommand): Promise<CertificateCommandEntity> {
        const entity = {
            ...generation,
            createdAt: new Date(),
            id: this.db.length + 1
        };

        this.db.push(entity);

        return entity;
    }

    public async getAll(): Promise<CertificateCommandEntity[]> {
        return this.db;
    }

    public async getById(commandId: number): Promise<CertificateCommandEntity | null> {
        const found = this.db.find((e) => e.id === commandId);

        return found ?? null;
    }
}
