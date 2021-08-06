import { EnergyTransferRequest, State } from '../src';
import { bootstrapTestInstance } from './setup-e2e';
import { times } from 'lodash';

jest.setTimeout(60 * 60 * 1000);
process.env.CERTIFICATE_QUEUE_DELAY = '10000';

const wait = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));
const isInProgress = (request: EnergyTransferRequest) => {
    return [
        State.TransferInProgress,
        State.ValidationInProgress,
        State.IssuanceInProgress,
        State.PersistenceAwaiting,
        State.TransferAwaiting,
        State.IssuanceAwaiting,
        State.ValidationAwaiting
    ].includes(request.toAttrs().state);
};

describe('Transfer module - e2e', () => {
    it('works with 100 transactions', async () => {
        const { app, startProcess, repository } = await bootstrapTestInstance();

        const count = 100;

        await app.init();

        times(count, () => startProcess());

        while (true) {
            await wait(15);

            const requests = await repository.findAll();

            if (requests.some(isInProgress)) {
                continue;
            } else {
                break;
            }
        }

        const requests = await repository.findAll();

        expect(requests).toHaveLength(count);
        expect(requests.every((e) => e!.toAttrs().state === State.Transferred)).toBe(true);

        await app.close();
    });
});
