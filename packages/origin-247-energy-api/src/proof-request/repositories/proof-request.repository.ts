import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Reading } from '../../util';
import { ProofRequest, ProofRequestState, proofRequestTableName } from '../proof-request.entity';

interface CreateNewRequestPayload {
    deviceId: string;
    reading: Reading;
}

interface SaveProcessingErrorParams {
    error: string;
    requestIds: number[];
}

@Injectable()
export class ProofRequestsRepository {
    constructor(
        @InjectRepository(ProofRequest)
        private repository: Repository<ProofRequest>
    ) {}

    public async createNewRequest(...payload: CreateNewRequestPayload[]): Promise<void> {
        await this.repository.save(
            payload.map((p) => ({
                deviceId: p.deviceId,
                reading: p.reading,
                state: ProofRequestState.Pending,
                processError: null
            }))
        );
    }

    public async saveProcessingError(params: SaveProcessingErrorParams): Promise<void> {
        await this.repository.update(
            { id: In(params.requestIds) },
            { processError: params.error, state: ProofRequestState.ProcessingError }
        );
    }

    public async markRequestsAsProcessing(requestIds: number[]): Promise<void> {
        await this.repository.update(
            { id: In(requestIds) },
            { state: ProofRequestState.Processing }
        );
    }

    public async removeRequests(requestIds: number[]): Promise<void> {
        await this.repository.delete({ id: In(requestIds) });
    }

    public async findPendingRequests(): Promise<ProofRequest[]> {
        const result = await this.repository.query(
            `
      SELECT * FROM ${proofRequestTableName}
        WHERE "deviceId" = (
          SELECT "deviceId" FROM ${proofRequestTableName} WHERE state = $1 LIMIT 1
        )
        LIMIT 100
    `,
            [ProofRequestState.Pending]
        );

        return result
            ? result.map((r) => ({
                  ...r,
                  reading: JSON.parse(r.reading)
              }))
            : [];
    }
}
