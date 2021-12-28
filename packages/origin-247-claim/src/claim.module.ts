import { Module } from '@nestjs/common';
import {
    CertificateModule,
    CertificateForUnitTestsModule
} from '@energyweb/origin-247-certificate';
import { ClaimService } from './claim.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchResultEntity } from './repositories/MatchResult/MatchResult.entity';
import { ExcessGenerationEntity } from './repositories/ExcessGeneration/ExcessGeneration.entity';
import { LeftoverConsumptionEntity } from './repositories/LeftoverConsumption/LeftoverConsumption.entity';
import { MATCH_RESULT_REPOSITORY } from './repositories/MatchResult/MatchResult.repository';
import { MatchResultPostgresRepository } from './repositories/MatchResult/MatchResultPostgres.repository';
import { MatchResultInMemoryRepository } from './repositories/MatchResult/MatchResultInMemory.repository';
import { LEFTOVER_CONSUMPTION_REPOSITORY } from './repositories/LeftoverConsumption/LeftoverConsumption.repository';
import { LeftoverConsumptionPostgresRepository } from './repositories/LeftoverConsumption/LeftoverConsumptionPostgres.repository';
import { LeftoverConsumptionInMemoryRepository } from './repositories/LeftoverConsumption/LeftoverConsumptionInMemory.repository';
import { EXCESS_GENERATION_REPOSITORY } from './repositories/ExcessGeneration/ExcessGeneration.repository';
import { ExcessGenerationPostgresRepository } from './repositories/ExcessGeneration/ExcessGenerationPostgress.repository';
import { ClaimFacade } from './claim.facade';
import { ExcessGenerationInMemoryRepository } from './repositories/ExcessGeneration/ExcessGenerationInMemory.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MatchResultEntity,
            LeftoverConsumptionEntity,
            ExcessGenerationEntity
        ]),
        CertificateModule
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

@Module({
    imports: [CertificateForUnitTestsModule],
    providers: [
        ClaimService,
        {
            provide: MATCH_RESULT_REPOSITORY,
            useClass: MatchResultInMemoryRepository
        },
        {
            provide: LEFTOVER_CONSUMPTION_REPOSITORY,
            useClass: LeftoverConsumptionInMemoryRepository
        },
        {
            provide: EXCESS_GENERATION_REPOSITORY,
            useClass: ExcessGenerationInMemoryRepository
        },
        ClaimFacade
    ],
    exports: [ClaimFacade]
})
export class ClaimForUnitTestsModule {}
