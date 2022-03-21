import { Contracts } from '@energyweb/issuer';
import { providers } from 'ethers';
import { DeploymentProperties } from './types';

export async function deployContracts(
    web3: string,
    issuerPrivateKey: string
): Promise<DeploymentProperties> {
    const provider = new providers.FallbackProvider([new providers.JsonRpcProvider(web3)]);

    const registry = await Contracts.migrateRegistry(provider, issuerPrivateKey);
    const issuer = await Contracts.migrateIssuer(provider, issuerPrivateKey, registry.address);

    return {
        registry: registry.address,
        issuer: issuer.address
    };
}

export function getInsertDeploymentPropertiesQuery(properties: DeploymentProperties): string {
    return `INSERT INTO certificate_deployment_properties VALUES ('${properties.registry}', '${properties.issuer}');`;
}

export function getSelectDeploymentPropertiesQuery(): string {
    return `SELECT * FROM certificate_deployment_properties;`;
}
