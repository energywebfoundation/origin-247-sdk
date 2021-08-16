import { bootstrapTestInstance, userWallet } from './setup-e2e';
import { INestApplication } from '@nestjs/common';
import { MatchResultRepository } from '../src/repositories/MatchResult/MatchResult.repository';
import { DatabaseService } from '@energyweb/origin-backend-utils';
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
import { ClaimFacade } from '../src';

describe('Claiming - e2e', () => {
    let app: INestApplication;
    let matchResultRepository: MatchResultRepository;
    let databaseService: DatabaseService;
    let certificateService: CertificateService;
    let claimFacade: ClaimFacade;

    beforeAll(async () => {
        ({
            app,
            matchResultRepository,
            databaseService,
            claimFacade,
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

        const res = await claimFacade.claim({
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

    it('should save matches with metadata', async () => {
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
            {
                consumerId: 'consumerA',
                volume: BigNumber.from(100),
                customProperty: 'I want to have this',
                anotherCustomProperty: 42
            },
            { consumerId: 'consumerB', volume: BigNumber.from(100) }
        ];
        const generations = [
            { generatorId: 'generatorA', volume: BigNumber.from(100), certificateId: 1 },
            {
                generatorId: 'generatorB',
                volume: BigNumber.from(100),
                certificateId: 2,
                propForMeta: {}
            }
        ];
        const batchClaimSpy = jest.spyOn(certificateService, 'batchClaim');
        const matchRepoSpy = jest.spyOn(matchResultRepository, 'create');

        const res = await claimFacade.claim({
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

        expect(batchClaimSpy).toHaveBeenCalled();
        expect(matchRepoSpy).toHaveBeenCalled();

        expect(res.matches[0].consumerMetadata).toHaveProperty(
            'customProperty',
            'I want to have this'
        );
        expect(res.matches[0].consumerMetadata).toHaveProperty('anotherCustomProperty', 42);
        expect(res.matches[0].generatorMetadata).not.toHaveProperty('propForMeta');

        expect(res.matches[1].consumerMetadata).toHaveProperty(
            'customProperty',
            'I want to have this'
        );
        expect(res.matches[1].consumerMetadata).toHaveProperty('anotherCustomProperty', 42);
        expect(res.matches[1].generatorMetadata).toHaveProperty('propForMeta', {});
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
