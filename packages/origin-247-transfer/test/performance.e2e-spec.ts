import { State } from '../src';
import { bootstrapTestInstance } from './setup-e2e';
import { times } from 'lodash';

jest.setTimeout(60 * 60 * 1000);
process.env.CERTIFICATE_QUEUE_DELAY = '10000';

const wait = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

describe('Transfer module - e2e', () => {
    it('works with 100 transactions', async () => {
        const { app, startProcess, repository } = await bootstrapTestInstance();

        const count = 100;

        await app.init();

        times(count, () => startProcess());

        await wait(300);

        const requests = await repository.findAll();

        expect(requests).toHaveLength(count);
        expect(requests.every((e) => e!.toAttrs().state === State.Transferred)).toBe(true);

        await app.close();
    });
});
