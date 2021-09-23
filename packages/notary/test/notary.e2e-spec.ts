import { INestApplication } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { expect } from 'chai';
import { DatabaseService } from '@energyweb/origin-backend-utils';

import { bootstrapTestInstance } from './setup-e2e';
import { NotaryService, Reading, CreateProofCommand, NotaryProof, PreciseProofUtils } from '../src';

describe('Notary module - e2e', () => {
    let app: INestApplication;
    let notaryService: NotaryService;
    let databaseService: DatabaseService;
    let commandBus: CommandBus;

    beforeAll(async () => {
        ({ app, notaryService, databaseService, commandBus } = await bootstrapTestInstance());

        await app.init();
    });

    afterAll(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    it('deploys the smart contract on init', async () => {
        const contract = await notaryService.getNotaryContract();
        expect(contract).to.exist;
    });

    it('stores a smart meter reading proof on-chain', async () => {
        const readings: Reading[] = [
            {
                timestamp: Math.round(new Date('2021-09-21T08:00:00.000Z').getTime() / 1000),
                value: 123
            },
            {
                timestamp: Math.round(new Date('2021-09-21T09:00:00.000Z').getTime() / 1000),
                value: 456
            }
        ];

        const proof: NotaryProof = await commandBus.execute<CreateProofCommand>(
            new CreateProofCommand('deviceId123', readings)
        );

        const calculatedProof = PreciseProofUtils.generateProofs(readings, proof.salts);

        expect(proof.rootHash).to.equal(calculatedProof.rootHash);
    });
});
