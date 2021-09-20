import { expect } from 'chai';
import { bootstrapTestInstance } from './setup-e2e';

describe('Notary module - e2e', () => {
    it('deploys the smart contract on init', async () => {
        const { app, notaryService } = await bootstrapTestInstance();

        await app.init();

        const contract = await notaryService.getNotaryContract();
        console.log({ contract });
        expect(contract).to.exist;

        await app.close();
    });
});
