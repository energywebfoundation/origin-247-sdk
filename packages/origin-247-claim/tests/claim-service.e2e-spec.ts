import { bootstrapTestInstance, userWallet } from './setup-e2e';
import { INestApplication, Logger } from '@nestjs/common';
import { MatchResultRepository } from '../src/repositories/MatchResult/MatchResult.repository';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { LeftoverConsumptionRepository } from '../src/repositories/LeftoverConsumption/LeftoverConsumption.repository';
import { ExcessGenerationRepository } from '../src/repositories/ExcessGeneration/ExcessGeneration.repository';
import { ClaimService } from '../src/claim.service';
import { SpreadMatcher } from '../src/algorithms/spreadMatcher';
import {
    IConsumption,
    IGeneration,
    IMatch,
    IMatchingInput,
    IMatchingOutput
} from '../src/interfaces';
import { BigNumber } from 'ethers';
import { CertificateService, IBatchClaimCommand } from '@energyweb/origin-247-certificate';

jest.setTimeout(60 * 1000);

describe('Claiming - e2e', () => {
    let app: INestApplication;
    let matchResultRepository: MatchResultRepository;
    let databaseService: DatabaseService;
    let leftoverConsumptionRepository: LeftoverConsumptionRepository;
    let excessGenerationRepository: ExcessGenerationRepository;
    let claimService: ClaimService;
    let certificateService: CertificateService;

    beforeAll(async () => {
        ({
            app,
            matchResultRepository,
            databaseService,
            leftoverConsumptionRepository,
            excessGenerationRepository,
            claimService,
            certificateService
        } = await bootstrapTestInstance());

        await app.init();
    });

    beforeEach(async () => {
        await databaseService.cleanUp();
    });

    it('should match and claim', async () => {
        const groupPriority = [
            [
                {
                    id: 'consumerA',
                    groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                },
                {
                    id: 'consumerB',
                    groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                }
            ]
        ];
        const consumptions = [
            { consumerId: 'consumerA', volume: BigNumber.from(100) },
            { consumerId: 'consumerB', volume: BigNumber.from(100) }
        ];
        const generations = [
            { generatorId: 'generatorA', volume: BigNumber.from(100), certificateId: 1 },
            { generatorId: 'generatorB', volume: BigNumber.from(100), certificateId: 2 }
        ];
        const batchClaimSpy = jest.spyOn(certificateService, 'batchClaim');
        const matchRepoSpy = jest.spyOn(matchResultRepository, 'create');

        const res = await claimService.claim({
            algorithmFn: spreadMatcherAlgo(groupPriority),
            data: {
                consumptions: consumptions,
                generations: generations
            },
            claimCustomizationFn: claimCustomizer,
            timeframe: {
                from: new Date('2021-08-11T12:15:00.000Z'),
                to: new Date('2021-08-11T12:30:00.000Z')
            }
        });
        expect(res.matches).toHaveLength(4);
        expect(res.leftoverConsumptions).toHaveLength(0);
        expect(res.excessGenerations).toHaveLength(0);
        expect(batchClaimSpy).toHaveBeenCalled();
        expect(matchRepoSpy).toHaveBeenCalled();
    });
});

const spreadMatcherAlgo = (groupPriority: any): ((input: IMatchingInput) => IMatchingOutput) => {
    return (input: IMatchingInput) => {
        const res = SpreadMatcher.spreadMatcher({
            groupPriority: groupPriority,
            entityGroups: [
                input.consumptions.map((c) => ({ ...c, id: c.consumerId })),
                input.generations.map((g) => ({ ...g, id: g.generatorId }))
            ]
        });

        return {
            matches: res.matches.map((m) => ({
                volume: m.volume,
                consumption: m.entities[0],
                generation: m.entities[1]
            })),
            leftoverConsumptions: res.leftoverEntities[0],
            excessGenerations: res.leftoverEntities[1]
        };
    };
};

const claimCustomizer = (input: IMatch<IConsumption, IGeneration>[]): IBatchClaimCommand[] => {
    return [
        {
            certificates: input.map((m) => ({
                certificateId: m.generation.certificateId,
                energyValue: m.volume.toString()
            })),
            claimData: {},
            forAddress: userWallet.address
        }
    ];
};
