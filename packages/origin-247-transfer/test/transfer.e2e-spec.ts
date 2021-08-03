import { TransferValidationStatus } from '../src';
import { bootstrapTestInstance } from './setup-e2e';

jest.setTimeout(120 * 1000);

describe('Transfer module - e2e', () => {
    it('works with happy path with 2 processes at once', async () => {
        const {
            app,
            startProcess,
            certificateService,
            repository,
            databaseService
        } = await bootstrapTestInstance();

        await app.init();

        startProcess();
        startProcess();

        await new Promise((resolve) => setTimeout(resolve, 60 * 1000));

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

        const etr2 = (await repository.findById(2))!;
        const etr2Attrs = etr2.toAttrs();
        const certificate2 = (await certificateService.getById(2))!;

        expect(etr2Attrs.certificateId).toBe(2);
        expect(etr2Attrs.computedValidationStatus).toBe(TransferValidationStatus.Valid);
        expect(etr2Attrs.buyerAddress).toBe('0xeF99b2A55E6D070bA2D12f79b368148BF7d6Fc10');
        expect(etr2Attrs.sellerAddress).toBe('0x212fb883109dC887a605B09078E219Db75e5AAc7');
        expect(etr2Attrs.generatorId).toBe('a1');
        expect(etr2Attrs.isCertificatePersisted).toBe(true);
        expect(etr2Attrs.volume).toBe('60');
        expect(etr2.isValid()).toBe(true);

        expect(certificate2.owners['0x212fb883109dC887a605B09078E219Db75e5AAc7']).toBe('0');
        expect(certificate2.owners['0xeF99b2A55E6D070bA2D12f79b368148BF7d6Fc10']).toBe('60');
        expect(certificate2.deviceId).toBe('a1');

        await app.close();
    });
});
