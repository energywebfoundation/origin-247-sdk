import { Module } from '@nestjs/common';
import { EnergyApi247Facade } from './energy-api.facade';
import { NotaryModule } from './notary/notary.module';
import { ProofRequestModule } from './proof-request/proof-request.module';
import { ReadsModule } from './reads/reads.module';

@Module({
    imports: [ProofRequestModule, NotaryModule, ReadsModule],
    providers: [EnergyApi247Facade],
    exports: [EnergyApi247Facade]
})
export class EnergyApi247Module {}
