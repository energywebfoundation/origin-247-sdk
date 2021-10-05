import { INestApplication } from '@nestjs/common';
import { DatabaseService } from '@energyweb/origin-backend-utils';

import { bootstrapTestInstance } from './setup-e2e';
import { EnergyApi247Facade } from '../src/energy-api.facade';
import { RequestReadingProofPayload } from '../src';
import { NotaryService } from '../src/notary/notary.service';

jest.setTimeout(50000);

describe('Notary module - e2e', () => {
    let app: INestApplication;
    let facade: EnergyApi247Facade;
    let notaryService: NotaryService;
    let databaseService: DatabaseService;

    beforeAll(async () => {
        ({ app, facade, databaseService, notaryService } = await bootstrapTestInstance());

        await app.init();
    });

    afterAll(async () => {
        await app.close();
        await databaseService.cleanUp();
    });

    it('create multiple proofs and reads', async () => {
        await facade.requestReadingProof(...input.d1.slice(0, 2), ...input.d2.slice(0, 2));

        await new Promise((resolve) => setTimeout(resolve, 5000));

        await facade.requestReadingProof(...input.d1.slice(2), ...input.d2.slice(2));

        await new Promise((resolve) => setTimeout(resolve, 15000));

        const proofs = await notaryService.getAllProofs();

        expect(proofs).toHaveLength(2);

        expect(proofs[0]).toHaveProperty('deviceId', 'd1');
        expect(proofs[0].readings).toHaveLength(3);
        expect(proofs[0].readings[0]).toHaveProperty('value', '1');
        expect(proofs[0].readings[1]).toHaveProperty('value', '2');
        expect(proofs[0].readings[2]).toHaveProperty('value', '3');

        expect(proofs[1]).toHaveProperty('deviceId', 'd2');
        expect(proofs[1].readings).toHaveLength(3);
        expect(proofs[1].readings[0]).toHaveProperty('value', '1');
        expect(proofs[1].readings[1]).toHaveProperty('value', '2');
        expect(proofs[1].readings[2]).toHaveProperty('value', '3');
    });
});

const now = new Date();
const devices = ['d1', 'd2'];

const input = devices.reduce((acc, deviceId) => {
    const readings = [] as RequestReadingProofPayload[];

    for (let i = 0; i < 3; i += 1) {
        readings.push({
            deviceId,
            reading: { timestamp: now, value: (i + 1).toString() }
        });
    }

    return {
        ...acc,
        [deviceId]: readings
    };
}, {} as Record<string, RequestReadingProofPayload[]>);
