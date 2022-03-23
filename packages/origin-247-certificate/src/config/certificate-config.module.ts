import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
    CertificateConfigService,
    registerNamespacedConfiguration
} from './certificate-config.service';

@Global()
@Module({
    providers: [CertificateConfigService],
    exports: [CertificateConfigService],
    imports: [ConfigModule.forFeature(registerNamespacedConfiguration)]
})
export class CertificateConfigModule {}
