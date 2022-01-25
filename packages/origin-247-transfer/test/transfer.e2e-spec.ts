import { State } from '../src';
import { bootstrapTestInstance } from './setup-e2e';

jest.setTimeout(60 * 60 * 1000);

const wait = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

describe('Transfer module - e2e', () => {
    it('works with happy path - two processes in parallel', async () => {
        const { app, startProcess, certificateService, repository } = await bootstrapTestInstance();

        await app.init();

        startProcess();
        startProcess();

        await wait(150);

        const etr = (await repository.findById(1))!;
        const etrAttrs = etr.toAttrs();
        const certificate = (await certificateService.getById(etr.certificateId!))!;

        expect(etrAttrs.state).toBe(State.Transferred);
        expect(etrAttrs.buyerAddress).toBe('0xeF99b2A55E6D070bA2D12f79b368148BF7d6Fc10');
        expect(etrAttrs.sellerAddress).toBe('0x212fb883109dC887a605B09078E219Db75e5AAc7');
        expect(etrAttrs.certificateData.generatorId).toBe('a1');
        expect(etrAttrs.certificateData.metadata.field).toBe('test');
        expect(etrAttrs.volume).toBe('60');

        expect(certificate.owners['0x212fb883109dC887a605B09078E219Db75e5AAc7']).toBe('0');
        expect(certificate.owners['0xeF99b2A55E6D070bA2D12f79b368148BF7d6Fc10']).toBe('60');
        expect(certificate.deviceId).toBe('a1');

        const etr2 = (await repository.findById(2))!;
        const etr2Attrs = etr2.toAttrs();
        const certificate2 = (await certificateService.getById(etr2.certificateId!))!;

        expect(etr2Attrs.state).toBe(State.Transferred);
        expect(etr2Attrs.buyerAddress).toBe('0xeF99b2A55E6D070bA2D12f79b368148BF7d6Fc10');
        expect(etr2Attrs.sellerAddress).toBe('0x212fb883109dC887a605B09078E219Db75e5AAc7');
        expect(etr2Attrs.certificateData.generatorId).toBe('a1');
        expect(etr2Attrs.certificateData.metadata.field).toBe('test');
        expect(etr2Attrs.volume).toBe('60');

        expect(certificate2.owners['0x212fb883109dC887a605B09078E219Db75e5AAc7']).toBe('0');
        expect(certificate2.owners['0xeF99b2A55E6D070bA2D12f79b368148BF7d6Fc10']).toBe('60');
        expect(certificate2.deviceId).toBe('a1');

        await app.close();
    });
});
