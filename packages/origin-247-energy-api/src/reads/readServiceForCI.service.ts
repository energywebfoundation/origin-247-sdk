import {
    AggregatedReadDTO,
    FilterDTO,
    MeasurementDTO,
    ReadDTO,
    AggregateFilterDTO
} from '@energyweb/energy-api-influxdb';
import { ReadsService } from './reads.service';

type PublicPart<T> = { [K in keyof T]: T[K] };

/**
 * Implementation for CI which doesn't use Influx.
 * Add/correct methods as you need.
 */
export class BaseReadServiceForCI implements PublicPart<ReadsService> {
    private readings: { meterId: string; readings: ReadDTO[]; proofRootHash: string }[] = [];

    public async aggregate(
        meterId: string,
        filter: AggregateFilterDTO
    ): Promise<AggregatedReadDTO[]> {
        const readings = this.readings
            .filter((r) => r.meterId === meterId)
            .flatMap((r) => r.readings)
            .filter(
                (r) => r.timestamp >= new Date(filter.start) && r.timestamp <= new Date(filter.end)
            );

        return [
            {
                start: new Date(),
                stop: new Date(),
                value: readings.reduce((sum, r) => sum + r.value, 0)
            }
        ];
    }

    public async find(meterId: string, filter: FilterDTO): Promise<ReadDTO[]> {
        return this.readings
            .filter((r) => r.meterId === meterId)
            .flatMap((r) => r.readings)
            .filter(
                (r) => r.timestamp >= new Date(filter.start) && r.timestamp <= new Date(filter.end)
            )
            .slice(filter.offset, filter.offset + filter.limit);
    }

    public async onModuleInit(): Promise<void> {
        return undefined;
    }

    public async storeWithProof(meterId: string, reads: ReadDTO[], proofRootHash: string) {
        this.readings.push({
            meterId,
            readings: reads.map((r) => ({
                ...r,
                timestamp: new Date(r.timestamp)
            })),
            proofRootHash
        });
    }

    public async findDifference(): Promise<ReadDTO[]> {
        throw new Error('Not implemented.');
    }

    public async store(meterId: string, measurement: MeasurementDTO): Promise<void> {
        throw new Error('Not implemented. Use `storeWithProof`');
    }

    public async findLatestRead() {
        throw new Error('Not implemented.');

        return {} as any;
    }

    public findLatestReadByMeterQuery() {
        throw new Error('Not implemented.');

        return '';
    }
}
