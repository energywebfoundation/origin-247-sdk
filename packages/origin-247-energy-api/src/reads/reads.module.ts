import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ReadsService } from './reads.service';
import { BaseReadServiceForCI } from './readServiceForCI.service';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { READ_SERVICE } from './const';

const readServiceProvider: Provider =
    process.env.NODE_ENV === 'e2e'
        ? { provide: READ_SERVICE, useClass: BaseReadServiceForCI }
        : { provide: READ_SERVICE, useClass: ReadsService };

@Module({
    imports: [CqrsModule],
    providers: [readServiceProvider],
    exports: [readServiceProvider]
})
export class ReadsModule {}
