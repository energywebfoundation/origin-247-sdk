import {
    MeasurementDTO,
    ReadDTO,
    ReadsService as OriginalReadsService
} from '@energyweb/energy-api-influxdb';
import { Point } from '@influxdata/influxdb-client';

/**
 * @HACK
 *
 * This hacky service is created because we don't want to change energy-api itself to store proof hashes.
 * We use OriginalReadsService to access configuration. If we add method with proof hashes, we drop original one,
 * create new method (which is copy of original one) that supports proof hashes, and use `@ts-expect-error`
 * to access private fields.
 *
 * This is super hacky, may fail in the future if energy-api gets changed,
 * but it's all for the sake of not changing energy-api.
 */
export class ReadsService extends OriginalReadsService {
    public async store(meterId: string, measurement: MeasurementDTO) {
        throw new Error('Not implemented. Use `storeWithProof`');
    }

    public async storeWithProof(meterId: string, reads: ReadDTO[], proofRootHash: string) {
        const points = reads.map((m) =>
            new Point('read')
                .tag('meter', meterId)
                .tag('proofRootHash', proofRootHash)
                .intField('read', m.value)
                .timestamp(new Date(m.timestamp))
        );

        // @ts-expect-error
        const writer = this.dbWriter;

        writer.writePoints(points);
        await writer.close();
    }
}
