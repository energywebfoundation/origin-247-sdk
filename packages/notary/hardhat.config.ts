import { task, HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';

// This adds support for typescript paths mappings
import 'tsconfig-paths/register';

task('accounts', 'Prints the list of accounts', async (args, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(await account.address);
    }
});

const config: HardhatUserConfig = {
    solidity: '0.8.4',
    typechain: {
        outDir: 'src/types',
        target: 'ethers-v5',
        alwaysGenerateOverloads: false,
        externalArtifacts: ['externalArtifacts/*.json']
    }
};

export default config;
