import {
    FilterDTO,
    ReadDTO as OriginalReadDTO,
    ReadsService as OriginalReadsService
} from '@energyweb/energy-api-influxdb';
import { Point } from '@influxdata/influxdb-client';

export class ReadDTO extends OriginalReadDTO {
    proofRootHash: string;
    proofLeafHash: string;
}

/**
 * @HACK
 *
 * This hacky service is created because we don't want to change energy-api itself to store proof hashes.
 * We use OriginalReadsService to access configuration. If we add method with proof hashes, we drop original one,
 * create new method (which is copy of original one) that supports proof hashes, and use `@ts-ignore`
 * to access private fields.
 *
 * This is super hacky, may fail in the future if energy-api gets changed,
 * but it's all for the sake of not changing energy-api.
 */
// @ts-ignore
export class ReadsService extends OriginalReadsService {
    public async store() {
        throw new Error('Not implemented. Use `storeWithProof`');
    }

    public async storeWithProof(
        meterId: string,
        proofRootHash: string,
        reads: { value: number; timestamp: Date; proofLeafHash: string }[]
    ) {
        const points = reads.map((m) =>
            new Point('read')
                .tag('meter', meterId)
                .tag('proofRootHash', proofRootHash)
                .tag('proofLeafHash', m.proofLeafHash)
                .intField('read', m.value)
                .timestamp(m.timestamp)
        );

        // @ts-ignore
        const writer = this.dbWriter;

        writer.writePoints(points);
        await writer.close();
    }

    public async find() {
        throw new Error('Not implemented. Use `findWithProof`');

        return [];
    }

    public async findWithProof(meterId: string, filter: FilterDTO): Promise<ReadDTO[]> {
        try {
            // @ts-ignore
            const query = this.findByMeterQuery(meterId, filter);

            // @ts-ignore
            return this.execute(query);
        } catch (e) {
            // @ts-ignore
            this.logger.error(e.message);
            throw e;
        }
    }

    private async execute(query: string): Promise<ReadDTO[]> {
        // @ts-ignore
        const data = await this.dbReader.collectRows(query);

        return data.map((record) => ({
            timestamp: new Date(record._time),
            value: Number(record._value),
            proofRootHash: record.proofRootHash,
            proofLeafHash: record.proofLeafHash
        }));
    }
}
