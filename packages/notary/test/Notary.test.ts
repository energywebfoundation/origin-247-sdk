import { expect } from 'chai';
import { utils } from 'ethers';
import { ethers } from 'hardhat';
import { getAllMeterReadings } from '../src';
import { Notary, Notary__factory } from '../src/typechain';

describe('Notary', () => {
    it('should store smart meter reading', async () => {
        const [owner] = await ethers.getSigners();
        const Notary: Notary__factory = await ethers.getContractFactory('Notary');

        const notaryContract: Notary = await Notary.deploy();

        const events = await getAllMeterReadings(notaryContract);
        expect(events).to.have.length(0);

        const randomProof = utils.randomBytes(32);

        const tx = await notaryContract.store(randomProof);
        await tx.wait();

        const newEvents = await getAllMeterReadings(notaryContract);
        expect(newEvents).to.have.length(1);

        expect(newEvents[0]).to.deep.include({
            operator: owner.address,
            proof: utils.hexlify(randomProof)
        });
    });
});
