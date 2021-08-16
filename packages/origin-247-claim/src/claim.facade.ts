import { ClaimService, IClaimInput } from './claim.service';
import { Injectable, Inject } from '@nestjs/common';
import {
    MatchResultRepository,
    MATCH_RESULT_REPOSITORY,
    FindOptions as FindMatchOptions,
    GroupEntity
} from './repositories/MatchResult/MatchResult.repository';
import {
    LeftoverConsumptionRepository,
    LEFTOVER_CONSUMPTION_REPOSITORY,
    FindOptions as FindLeftoverOptions
} from './repositories/LeftoverConsumption/LeftoverConsumption.repository';
import {
    ExcessGenerationRepository,
    EXCESS_GENERATION_REPOSITORY,
    FindOptions as FindExcessOptions
} from './repositories/ExcessGeneration/ExcessGeneration.repository';

@Injectable()
export class ClaimFacade {
    constructor(
        private claimService: ClaimService,
        @Inject(MATCH_RESULT_REPOSITORY)
        private matchResultRepository: MatchResultRepository,
        @Inject(LEFTOVER_CONSUMPTION_REPOSITORY)
        private leftoverConsumptionRepository: LeftoverConsumptionRepository,
        @Inject(EXCESS_GENERATION_REPOSITORY)
        private excessGenerationRepository: ExcessGenerationRepository
    ) {}

    public async claim(input: IClaimInput) {
        return await this.claimService.claim(input);
    }

    public async findLeftoverConsumption(options: FindLeftoverOptions) {
        return await this.leftoverConsumptionRepository.find(options);
    }

    public async findExcessGeneration(options: FindExcessOptions) {
        return await this.excessGenerationRepository.find(options);
    }

    public async findMatches(options: FindMatchOptions) {
        return await this.matchResultRepository.find(options);
    }

    public async findMatchesGrouped(
        options: FindMatchOptions,
        groupOptions: [GroupEntity] | [GroupEntity, GroupEntity]
    ) {
        return await this.matchResultRepository.findGrouped(options, groupOptions);
    }
}
