import { Module } from '@nestjs/common';
import { CertificateModule } from '@energyweb/origin-247-certificate';
import { ClaimService } from './claim.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchResultEntity } from './repositories/MatchResult/MatchResult.entity';
import { ExcessGenerationEntity } from './repositories/ExcessGeneration/ExcessGeneration.entity';
import { LeftoverConsumptionEntity } from './repositories/LeftoverConsumption/LeftoverConsumption.entity';
import { MATCH_RESULT_REPOSITORY } from './repositories/MatchResult/MatchResult.repository';
import { MatchResultPostgresRepository } from './repositories/MatchResult/MatchResultPostgres.repository';
import { LEFTOVER_CONSUMPTION_REPOSITORY } from './repositories/LeftoverConsumption/LeftoverConsumption.repository';
import { LeftoverConsumptionPostgresRepository } from './repositories/LeftoverConsumption/LeftoverConsumptionPostgres.repository';
import { EXCESS_GENERATION_REPOSITORY } from './repositories/ExcessGeneration/ExcessGeneration.repository';
import { ExcessGenerationPostgresRepository } from './repositories/ExcessGeneration/ExcessGenerationPostgress.repository';
import { ClaimFacade } from './claim.facade';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MatchResultEntity,
            LeftoverConsumptionEntity,
            ExcessGenerationEntity
        ]),
        CertificateModule.register()
    ],
    providers: [
        ClaimService,
        {
            provide: MATCH_RESULT_REPOSITORY,
            useClass: MatchResultPostgresRepository
        },
        {
            provide: LEFTOVER_CONSUMPTION_REPOSITORY,
            useClass: LeftoverConsumptionPostgresRepository
        },
        {
            provide: EXCESS_GENERATION_REPOSITORY,
            useClass: ExcessGenerationPostgresRepository
        },
        ClaimFacade
    ],
    exports: [ClaimFacade]
})
export class ClaimModule {}
