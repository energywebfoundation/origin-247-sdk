import { AggregatedReadDTO, FilterDTO } from '@energyweb/energy-api-influxdb';
import { ReadDTO, ReadsService } from './reads.service';

type PublicPart<T> = { [K in keyof T]: T[K] };

/**
 * Implementation for CI which doesn't use Influx.
 * Add/correct methods as you need.
 */
export class BaseReadServiceForCI implements PublicPart<ReadsService> {
    private readings: { meterId: string; readings: ReadDTO[]; proofRootHash: string }[] = [];

    public async aggregate(): Promise<AggregatedReadDTO[]> {
        throw new Error('Not implemented.');

        return [];
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

    public async findWithProof(meterId: string, filter: FilterDTO): Promise<ReadDTO[]> {
        return this.readings
            .filter((r) => r.meterId === meterId)
            .flatMap((e) => e.readings.map((r) => ({ ...r, proofRootHash: e.proofRootHash })))
            .filter(
                (r) => r.timestamp >= new Date(filter.start) && r.timestamp <= new Date(filter.end)
            )
            .slice(filter.offset, filter.offset + filter.limit);
    }

    public async findDifference(): Promise<ReadDTO[]> {
        throw new Error('Not implemented.');
    }

    public async find() {
        throw new Error('Not implemented. Use `findWithProof`');

        return [];
    }

    public async store(): Promise<void> {
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
