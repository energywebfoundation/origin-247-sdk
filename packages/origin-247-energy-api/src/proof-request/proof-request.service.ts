import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Reading } from '..';
import { NotaryProof } from '../notary';
import { CreateProofCommand } from '../notary/commands/create-proof.command';
import { READ_SERVICE } from '../reads/const';
import { ReadsService } from '../reads/reads.service';
import { queueThrottle } from '../util/queueThrottle';
import { ReadingProofProcessedEvent } from './ReadingProofProcessed.event';
import { ProofRequestsRepository } from './repositories/proof-request.repository';

export interface RequestReadingProofPayload {
    deviceId: string;
    reading: {
        timestamp: Date;
        value: string;
    };
}

@Injectable()
export class ProofRequestService {
    constructor(
        private repository: ProofRequestsRepository,
        private commandBus: CommandBus,
        private eventBus: EventBus,
        @Inject(READ_SERVICE)
        private readService: ReadsService
    ) {}

    private processRequestsTrigger = queueThrottle(
        () => this.processRequests(),
        Number(process.env.ENERGY_REQUEST_PROCESS_AGGREGATE_SECONDS ?? 10)
    );

    public onApplicationBootstrap() {
        this.processRequestsTrigger.trigger();
    }

    public onModuleDestroy() {
        this.processRequestsTrigger.unsubscribe();
    }

    public async requestReadingProof(...payload: RequestReadingProofPayload[]) {
        const withUnixTimestamp = payload.map((p) => ({
            ...p,
            reading: {
                ...p.reading,
                timestamp: Math.round(p.reading.timestamp.getTime() / 1000)
            }
        }));
        await this.repository.createNewRequest(...withUnixTimestamp);

        this.processRequestsTrigger.trigger();
    }

    private async processRequests() {
        const requests = await this.repository.findPendingRequests();

        if (requests.length === 0) {
            return;
        }

        const deviceId = requests[0].deviceId;
        const requestIds = requests.map((r) => r.id);
        const readings = requests.map((r) => r.reading);
        const readingsWithDate = readings.map((r) => ({
            timestamp: new Date(r.timestamp * 1000),
            value: r.value
        }));
        const createProofCommand = new CreateProofCommand(deviceId, readings);

        try {
            await this.repository.markRequestsAsProcessing(requestIds);

            const proof: NotaryProof = await this.commandBus.execute(createProofCommand);
            const proofedReadings = proof.leafs.map((leaf) => {
                const parsedValue = JSON.parse(leaf.value) as {
                    timestamp: number;
                    value: string;
                };

                return {
                    value: Number(parsedValue.value),
                    timestamp: new Date(parsedValue.timestamp * 1000),
                    proofLeafHash: leaf.hash
                };
            });

            await this.readService.storeWithProof(deviceId, proof.rootHash, proofedReadings);

            await this.repository.removeRequests(requestIds);

            const processedEvent = new ReadingProofProcessedEvent(
                deviceId,
                proof.rootHash,
                proofedReadings.map((r) => ({
                    ...r,
                    value: String(r.value)
                }))
            );

            this.eventBus.publish(processedEvent);
        } catch (e) {
            console.error(e);

            await this.repository.saveProcessingError({
                error: e.message,
                requestIds
            });
        }

        // This loop is necessary because only one device group is processed at once
        this.processRequestsTrigger.trigger();
    }
}
