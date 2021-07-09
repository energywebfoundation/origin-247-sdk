import { TransferValidationStatus } from '../src';
import { bootstrapTestInstance } from './setup-e2e';

jest.setTimeout(60 * 1000);

describe('Transfer module - e2e', () => {
    it('works with happy path', async () => {
        const { app, startProcess, certificateService, repository } = await bootstrapTestInstance();

        await app.init();

        startProcess();

        await new Promise((resolve) => setTimeout(resolve, 30 * 1000));

        const etr = (await repository.findById(1))!;
        const etrAttrs = etr.toAttrs();
        const certificate = (await certificateService.getById(1))!;

        expect(etrAttrs.certificateId).toBe(1);
        expect(etrAttrs.computedValidationStatus).toBe(TransferValidationStatus.Valid);
        expect(etrAttrs.buyerAddress).toBe('0xeF99b2A55E6D070bA2D12f79b368148BF7d6Fc10');
        expect(etrAttrs.sellerAddress).toBe('0x212fb883109dC887a605B09078E219Db75e5AAc7');
        expect(etrAttrs.generatorId).toBe('a1');
        expect(etrAttrs.isCertificatePersisted).toBe(true);
        expect(etrAttrs.volume).toBe('60');
        expect(etr.isValid()).toBe(true);

        expect(certificate.owners['0x212fb883109dC887a605B09078E219Db75e5AAc7']).toBe('0');
        expect(certificate.owners['0xeF99b2A55E6D070bA2D12f79b368148BF7d6Fc10']).toBe('60');
        expect(certificate.deviceId).toBe('a1');

        await app.close();
    });
});
