import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import {
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Repository,
    UpdateDateColumn,
    Column,
    Connection
} from 'typeorm';
import {
    EnergyTransferRequest,
    EnergyTransferRequestAttrs,
    TransferValidationStatus
} from '../EnergyTransferRequest';
import {
    ICreateNewCommand,
    EnergyTransferRequestRepository
} from './EnergyTransferRequest.repository';

const tableName = 'energy_transfer_request';

@Entity(tableName)
export class EnergyTransferRequestEntity implements EnergyTransferRequestAttrs {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'text' })
    sellerId: string;

    @Column({ type: 'text' })
    buyerId: string;

    @Column({ type: 'text' })
    generatorId: string;

    @Column({ type: 'text' })
    volume: string;

    @Column({ type: 'int4', nullable: true, unique: true })
    certificateId: number | null;

    @Column({ type: 'boolean' })
    isCertificatePersisted: boolean;

    @Column('simple-json')
    validationStatus: Record<string, TransferValidationStatus>;
}

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

    public async createNew(command: ICreateNewCommand): Promise<EnergyTransferRequest> {
        const { buyerId, sellerId, volume, generatorId } = command;

        const entity = this.repository.create({
            buyerId,
            sellerId,
            volume,
            generatorId,
            certificateId: null,
            isCertificatePersisted: false,
            validationStatus: {}
        });

        const savedEntity = await this.repository.save(entity);

        return EnergyTransferRequest.fromAttrs(savedEntity);
    }

    public async findByCertificateId(certificateId: number): Promise<EnergyTransferRequest | null> {
        const request = await this.repository.findOne({ certificateId });

        return request ? EnergyTransferRequest.fromAttrs(request) : null;
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
                SELECT * FROM ${tableName} FOR UPDATE
                WHERE id = $1
            `,
                [id]
            );

            if (!rawRequest) {
                return;
            }

            const request = EnergyTransferRequest.fromAttrs({
                ...rawRequest,
                validationStatus: JSON.parse(rawRequest.validationStatus)
            });

            cb(request);

            const updateQuery = this.connection
                .createQueryBuilder()
                .update(EnergyTransferRequestEntity)
                .set(request.toAttrs())
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
