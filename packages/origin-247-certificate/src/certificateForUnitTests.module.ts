import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CertificateForUnitTestsService } from './certificateForUnitTests.service';
import { CERTIFICATE_SERVICE_TOKEN } from './types';

const serviceProvider = {
    provide: CERTIFICATE_SERVICE_TOKEN,
    useClass: CertificateForUnitTestsService
};

@Module({
    providers: [serviceProvider],
    exports: [serviceProvider],
    imports: [CqrsModule]
})
export class CertificateForUnitTestsModule {}
