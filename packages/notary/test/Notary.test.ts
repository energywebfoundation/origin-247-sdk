import { expect } from 'chai';
import { utils } from 'ethers';
import { ethers } from 'hardhat';
import { Notary, PreciseProofUtils, Reading } from '../src';
import { Notary as NotaryContract, Notary__factory } from '../src/typechain';

describe('Notary', () => {
    const meterReadings: Reading[] = [
        {
            timestamp: new Date().getTime() / 1000,
            value: 100
        }
    ];

    it('should store smart meter reading', async () => {
        const [owner] = await ethers.getSigners();
        const notaryFactory: Notary__factory = await ethers.getContractFactory('Notary');

        const notaryContract: NotaryContract = await notaryFactory.deploy();

        const notary = new Notary(notaryContract.address, owner);

        const events = await notary.getMeterReadings();
        expect(events).to.have.length(0);

        const tx = await notary.storeMeterReadings(meterReadings, ['testSalt']);
        await tx.wait();

        const newEvents = await notary.getMeterReadings();
        expect(newEvents).to.have.length(1);

        const { rootHash } = PreciseProofUtils.generateProofs(meterReadings, ['testSalt']);

        expect(newEvents[0]).to.deep.include({
            operator: owner.address,
            proof: rootHash
        });
    });
});
