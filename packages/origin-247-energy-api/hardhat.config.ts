import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';

// This adds support for typescript paths mappings
import 'tsconfig-paths/register';

const config: HardhatUserConfig = {
    solidity: '0.8.4',
    typechain: {
        outDir: 'src/typechain',
        target: 'ethers-v5',
        alwaysGenerateOverloads: false,
        externalArtifacts: ['externalArtifacts/*.json']
    }
};

export default config;
