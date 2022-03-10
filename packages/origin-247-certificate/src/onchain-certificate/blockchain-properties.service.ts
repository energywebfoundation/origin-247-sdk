import { Injectable, OnModuleInit } from '@nestjs/common';
import { IBlockchainProperties, Contracts } from '@energyweb/issuer';
import { ConfigService } from '@nestjs/config';
import { DeploymentPropertiesRepository } from './repositories/deploymentProperties/deploymentProperties.repository';
import { providers, Signer, Wallet } from 'ethers';
import { getProviderWithFallback } from '@energyweb/utils-general';

@Injectable()
export class BlockchainPropertiesService {
    private primaryRPC: string;
    private issuerPrivateKey: string;
    private mnemonic: string;

    constructor(
        private configService: ConfigService,
        private deploymentPropsRepo: DeploymentPropertiesRepository
    ) {
        const primaryRPC = this.configService.get<string>('WEB3');
        const issuerPrivateKey = this.configService.get<string>('ISSUER_PRIVATE_KEY');
        const mnemonic = this.configService.get<string>('MNEMONIC');

        if (!primaryRPC) {
            throw new Error('No WEB3 environment variable set');
        }

        if (!issuerPrivateKey) {
            throw new Error('No ISSUER_PRIVATE_KEY environment variable set');
        }

        if (!mnemonic) {
            throw new Error('No MNEMONIC environment variable set');
        }

        this.primaryRPC = primaryRPC;
        this.issuerPrivateKey = issuerPrivateKey;
        this.mnemonic = mnemonic;
    }

    async getProperties(): Promise<IBlockchainProperties> {
        const { registry } = await this.deploymentPropsRepo.get();

        const web3 = getProviderWithFallback(...[this.primaryRPC].filter((url) => Boolean(url)));

        let signer: Signer = new Wallet(this.assure0x(this.issuerPrivateKey), web3);

        return {
            web3,
            registry: Contracts.factories.RegistryExtendedFactory.connect(registry, signer),
            issuer: Contracts.factories.IssuerFactory.connect(this.issuerPrivateKey, signer),
            activeUser: signer
        };
    }

    async deploy(): Promise<void> {
        if (await this.deploymentPropsRepo.propertiesExist()) {
            return;
        }

        const provider = new providers.FallbackProvider([
            new providers.JsonRpcProvider(this.primaryRPC)
        ]);

        const registry = await Contracts.migrateRegistry(provider, this.issuerPrivateKey);
        const issuer = await Contracts.migrateIssuer(
            provider,
            this.issuerPrivateKey,
            registry.address
        );

        await this.deploymentPropsRepo.save({ registry: registry.address });
    }

    private assure0x = (privateKey: string) =>
        privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
}
