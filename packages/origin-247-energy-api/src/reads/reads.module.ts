import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { READ_SERVICE } from './const';
import { ReadsService } from './reads.service';
import { BaseReadServiceForCI } from './readServiceForCI.service';

const readServiceProvider = {
    provide: READ_SERVICE,
    useFactory: (configService: ConfigService) => {
        if (configService.get<string>('NODE_ENV') === 'e2e') {
            return new BaseReadServiceForCI();
        }
        return new ReadsService(configService);
    },
    inject: [ConfigService]
};

@Module({
    imports: [ConfigModule, CqrsModule],
    providers: [readServiceProvider],
    exports: [readServiceProvider]
})
export class ReadsModule {}
