import { ConfigService, registerAs } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { getConfiguration } from './configuration';
import { CERTIFICATE_247_NAMESPACE, Configuration } from './config.interface';

@Injectable()
export class CertificateConfigService {
    constructor(private configService: ConfigService) {}

    public get<T = string>(key: keyof Configuration): T {
        return this.configService.get(namespaced(key))!;
    }
}

type NamespacedKey = `${typeof CERTIFICATE_247_NAMESPACE}.${keyof Configuration}`;

const namespaced = (key: keyof Configuration): NamespacedKey =>
    `${CERTIFICATE_247_NAMESPACE}.${key}`;

export const registerNamespacedConfiguration = registerAs(
    CERTIFICATE_247_NAMESPACE,
    getConfiguration
);
