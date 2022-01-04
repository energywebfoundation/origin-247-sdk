import { Injectable, Inject } from '@nestjs/common';
import {
    ExcessGenerationRepository,
    EXCESS_GENERATION_REPOSITORY,
    NewExcessGeneration
} from './repositories/ExcessGeneration/ExcessGeneration.repository';
import {
    LeftoverConsumptionRepository,
    LEFTOVER_CONSUMPTION_REPOSITORY,
    NewLeftoverConsumption
} from './repositories/LeftoverConsumption/LeftoverConsumption.repository';
import {
    MatchResultRepository,
    MATCH_RESULT_REPOSITORY,
    NewMatchResult
} from './repositories/MatchResult/MatchResult.repository';
import {
    IConsumption,
    IGeneration,
    IMatch,
    IMatchingInput,
    IMatchingOutput,
    ITimeFrame
} from './interfaces';
import {
    CertificateService,
    CERTIFICATE_SERVICE_TOKEN,
    IClaimCommand
} from '@energyweb/origin-247-certificate';

import { omit } from 'lodash';

export interface IClaimInput {
    algorithmFn: (input: IMatchingInput) => IMatchingOutput;
    claimCustomizationFn: (input: IMatch<IConsumption, IGeneration>[]) => IClaimCommand[];
    data: IMatchingInput;
    timeframe: ITimeFrame;
}

export interface IRaport {
    matches: NewMatchResult[];
    leftoverConsumptions: NewLeftoverConsumption[];
    excessGenerations: NewExcessGeneration[];
}

@Injectable()
export class ClaimService {
    constructor(
        @Inject(MATCH_RESULT_REPOSITORY)
        private matchResultRepo: MatchResultRepository,
        @Inject(LEFTOVER_CONSUMPTION_REPOSITORY)
        private leftoverConsumptionRepo: LeftoverConsumptionRepository,
        @Inject(EXCESS_GENERATION_REPOSITORY)
        private excessGenerationRepo: ExcessGenerationRepository,
        @Inject(CERTIFICATE_SERVICE_TOKEN)
        private certificateService: CertificateService<unknown>
    ) {}

    public async claim(input: IClaimInput) {
        const { algorithmFn, data, timeframe, claimCustomizationFn } = input;

        const matchingResult = algorithmFn(data);
        const filteredMatchingResult = this.filterZeroVolumeMatches(matchingResult);

        const resultsForClaim = claimCustomizationFn(filteredMatchingResult.matches);
        await this.certificateService.batchClaim(resultsForClaim);

        const raport = this.createRaport(filteredMatchingResult, timeframe);
        await this.createLogs(raport);

        return raport;
    }

    private createRaport(matchingResult: IMatchingOutput, timeframe: ITimeFrame): IRaport {
        const mappedMatches: NewMatchResult[] = matchingResult.matches.map((m) => ({
            volume: m.volume.toString(),
            consumerId: m.consumption.consumerId,
            consumerMetadata: omit(m.consumption, 'volume', 'consumerId'),
            generatorId: m.generation.generatorId,
            generatorMetadata: omit(m.generation, 'volume', 'generatorId'),
            timestamp: timeframe.to
        }));

        const mappedLeftoverConsumptions: NewLeftoverConsumption[] = matchingResult.leftoverConsumptions.map(
            (lc) => ({
                consumerId: lc.consumerId,
                consumerMetadata: lc,
                volume: lc.volume.toString(),
                timestamp: timeframe.to
            })
        );

        const mappedExcessGenerations: NewExcessGeneration[] = matchingResult.excessGenerations.map(
            (eg) => ({
                generatorId: eg.generatorId,
                generatorMetadata: eg,
                volume: eg.volume.toString(),
                timestamp: timeframe.to
            })
        );

        return {
            matches: mappedMatches,
            leftoverConsumptions: mappedLeftoverConsumptions,
            excessGenerations: mappedExcessGenerations
        };
    }

    private async createLogs(raport: IRaport): Promise<void> {
        await Promise.all([
            this.createMatchResultLogs(raport.matches),
            this.createLeftoverConsumptionLogs(raport.leftoverConsumptions),
            this.createExcessGenerationLogs(raport.excessGenerations)
        ]);
    }

    private async createMatchResultLogs(matchResults: NewMatchResult[]): Promise<void> {
        await Promise.all(
            matchResults.map(async (mr) => {
                await this.matchResultRepo.create(mr);
            })
        );
    }

    private async createLeftoverConsumptionLogs(
        leftoverConsumptions: NewLeftoverConsumption[]
    ): Promise<void> {
        await Promise.all(
            leftoverConsumptions.map(async (lc) => {
                await this.leftoverConsumptionRepo.create(lc);
            })
        );
    }

    private async createExcessGenerationLogs(
        excessGenerations: NewExcessGeneration[]
    ): Promise<void> {
        await Promise.all(
            excessGenerations.map(async (eg) => {
                await this.excessGenerationRepo.create(eg);
            })
        );
    }

    private filterZeroVolumeMatches(matchingResult: IMatchingOutput): IMatchingOutput {
        return {
            matches: matchingResult.matches.filter((m) => m.volume.gt(0)),
            leftoverConsumptions: matchingResult.leftoverConsumptions.filter((lc) =>
                lc.volume.gt(0)
            ),
            excessGenerations: matchingResult.excessGenerations.filter((eg) => eg.volume.gt(0))
        };
    }
}
