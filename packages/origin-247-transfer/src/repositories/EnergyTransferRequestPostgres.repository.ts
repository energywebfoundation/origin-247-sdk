import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { EnergyTransferRequest, NewAttributesParams, State } from '../EnergyTransferRequest';
import { EnergyTransferRequestEntity, tableName } from './EnergyTransferRequest.entity';
import { EnergyTransferRequestRepository } from './EnergyTransferRequest.repository';
import { omit } from 'lodash';

@Injectable()
export class EnergyTransferRequestPostgresRepository implements EnergyTransferRequestRepository {
    constructor(
        @InjectRepository(EnergyTransferRequestEntity)
        private repository: Repository<EnergyTransferRequestEntity>,
        @InjectConnection()
        private connection: Connection
    ) {}

    public async save(entity: EnergyTransferRequest): Promise<void> {
        await this.repository.update({ id: entity.id }, entity.toAttrs());
    }

    public async saveManyInTransaction(entities: EnergyTransferRequest[]): Promise<void> {
        await this.connection.transaction(async (manager) => {
            const updates = entities.map((e) =>
                manager.update(EnergyTransferRequestEntity, { id: e.id }, e.toAttrs())
            );

            await Promise.all(updates);
        });
    }

    public async createNew(command: NewAttributesParams): Promise<EnergyTransferRequest> {
        const entity = this.repository.create(EnergyTransferRequest.newAttributes(command));

        const savedEntity = await this.repository.save(entity);

        return EnergyTransferRequest.fromAttrs(savedEntity);
    }

    public async findAll(): Promise<EnergyTransferRequest[]> {
        const results = await this.repository.find();

        return results.map(EnergyTransferRequest.fromAttrs);
    }

    public async findByCertificateId(certificateId: number): Promise<EnergyTransferRequest | null> {
        const request = await this.repository.findOne({ certificateId });

        return request ? EnergyTransferRequest.fromAttrs(request) : null;
    }

    public async findById(id: number): Promise<EnergyTransferRequest | null> {
        const request = await this.repository.findOne(id);

        return request ? EnergyTransferRequest.fromAttrs(request) : null;
    }

    public async findByState(state: State, limit: number): Promise<EnergyTransferRequest[]> {
        const results = await this.repository.find({
            where: { state },
            take: limit
        });

        return results.map(EnergyTransferRequest.fromAttrs);
    }

    /**
     * Allow to update status with "FOR UPDATE" transaction lock.
     *
     * It means, that even if multiple updates for the same request will come in parallel,
     * they will be queued by database engine, so all will get properly registered.
     */
    public async updateWithLock(
        id: number,
        cb: (entity: EnergyTransferRequest) => void
    ): Promise<void> {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.startTransaction();

        try {
            const [rawRequest] = await queryRunner.query(
                `
                SELECT * FROM ${tableName}
                WHERE id = $1
                FOR UPDATE
            `,
                [id]
            );

            if (!rawRequest) {
                return;
            }

            const request = EnergyTransferRequest.fromAttrs({
                ...rawRequest,
                certificateData: JSON.parse(rawRequest.certificateData),
                validationStatusRecord: JSON.parse(rawRequest.validationStatusRecord)
            });

            cb(request);

            const updateQuery = this.connection
                .createQueryBuilder()
                .update(EnergyTransferRequestEntity)
                .set(request.toAttrs())
                .where({ id: request.id })
                .getQueryAndParameters();

            await queryRunner.query(updateQuery[0], updateQuery[1]);

            await queryRunner.commitTransaction();
        } catch (e) {
            await queryRunner.rollbackTransaction();

            throw e;
        } finally {
            await queryRunner.release();
        }
    }
}
