import { BigNumber } from 'ethers';
import { SpreadMatcher } from '../src';

describe('spreadMatcher', () => {
    describe('consumer priority', () => {
        it('2 consumers within same group - should distribute evenly between same priority consumers', () => {
            const result = integerMatcher({
                groupPriority: [
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
                ],
                entityGroups: [
                    [
                        { id: 'consumerA', volume: 100 },
                        { id: 'consumerB', volume: 100 }
                    ],
                    [
                        { id: 'generatorA', volume: 50 },
                        { id: 'generatorB', volume: 150 }
                    ]
                ]
            });

            expect(result.matches).toHaveLength(4);
            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 25
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 75
            });
            expect(result.matches[2]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorA' }],
                volume: 25
            });
            expect(result.matches[3]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorB' }],
                volume: 75
            });

            // leftover consumptions
            expect(result.leftoverEntities[0][0]).toEqual({
                id: 'consumerA',
                volume: 0
            });
            expect(result.leftoverEntities[0][1]).toEqual({
                id: 'consumerB',
                volume: 0
            });

            // excess generations
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 0
            });
            expect(result.leftoverEntities[1][1]).toEqual({
                id: 'generatorB',
                volume: 0
            });
        });

        it('2 consumers within same group - should distribute evenly between same priority consumers, regardless of consumptions', () => {
            const result = integerMatcher({
                groupPriority: [
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
                ],
                entityGroups: [
                    [
                        { id: 'consumerA', volume: 150 },
                        { id: 'consumerB', volume: 100 }
                    ],
                    [
                        { id: 'generatorA', volume: 50 },
                        { id: 'generatorB', volume: 150 }
                    ]
                ]
            });

            expect(result.matches).toHaveLength(4);
            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 25
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 75
            });
            expect(result.matches[2]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorA' }],
                volume: 25
            });
            expect(result.matches[3]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorB' }],
                volume: 75
            });

            // leftover consumptions
            expect(result.leftoverEntities[0][0]).toEqual({
                id: 'consumerA',
                volume: 50
            });
            expect(result.leftoverEntities[0][1]).toEqual({
                id: 'consumerB',
                volume: 0
            });

            // excess generations
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 0
            });
            expect(result.leftoverEntities[1][1]).toEqual({
                id: 'generatorB',
                volume: 0
            });
        });

        it('2 consumers within same group - should distribute one more to first consumer when generations are indivisible equally', () => {
            const result = integerMatcher({
                groupPriority: [
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
                ],
                entityGroups: [
                    [
                        { id: 'consumerA', volume: 100 },
                        { id: 'consumerB', volume: 100 }
                    ],
                    [
                        { id: 'generatorA', volume: 50 },
                        { id: 'generatorB', volume: 149 }
                    ]
                ]
            });

            expect(result.matches).toHaveLength(4);
            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 25
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 75
            });
            expect(result.matches[2]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorA' }],
                volume: 25
            });
            expect(result.matches[3]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorB' }],
                volume: 74
            });

            // leftover consumptions
            expect(result.leftoverEntities[0][0]).toEqual({
                id: 'consumerA',
                volume: 0
            });
            expect(result.leftoverEntities[0][1]).toEqual({
                id: 'consumerB',
                volume: 1
            });

            // excess generations
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 0
            });
            expect(result.leftoverEntities[1][1]).toEqual({
                id: 'generatorB',
                volume: 0
            });
        });

        it('3 consumers within same group - should distribute evenly between same priority consumers', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        {
                            id: 'consumerA',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        },
                        {
                            id: 'consumerB',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        },
                        {
                            id: 'consumerC',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        }
                    ]
                ],
                entityGroups: [
                    [
                        { id: 'consumerA', volume: 100 },
                        { id: 'consumerB', volume: 100 },
                        { id: 'consumerC', volume: 100 }
                    ],
                    [
                        { id: 'generatorA', volume: 75 },
                        { id: 'generatorB', volume: 150 }
                    ]
                ]
            });

            expect(result.matches).toHaveLength(6);
            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 25
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 50
            });
            expect(result.matches[2]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorA' }],
                volume: 25
            });
            expect(result.matches[3]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorB' }],
                volume: 50
            });
            expect(result.matches[4]).toEqual({
                entities: [{ id: 'consumerC' }, { id: 'generatorA' }],
                volume: 25
            });
            expect(result.matches[5]).toEqual({
                entities: [{ id: 'consumerC' }, { id: 'generatorB' }],
                volume: 50
            });

            // leftover consumptions
            expect(result.leftoverEntities[0][0]).toEqual({
                id: 'consumerA',
                volume: 25
            });
            expect(result.leftoverEntities[0][1]).toEqual({
                id: 'consumerB',
                volume: 25
            });
            expect(result.leftoverEntities[0][2]).toEqual({
                id: 'consumerC',
                volume: 25
            });

            // excess generations
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 0
            });
            expect(result.leftoverEntities[1][1]).toEqual({
                id: 'generatorB',
                volume: 0
            });
        });

        it('3 consumers within same group - should distribute last indivisible generation (1) to first consumer', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        {
                            id: 'consumerA',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        },
                        {
                            id: 'consumerB',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        },
                        {
                            id: 'consumerC',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        }
                    ]
                ],
                entityGroups: [
                    [
                        { id: 'consumerA', volume: 100 },
                        { id: 'consumerB', volume: 100 },
                        { id: 'consumerC', volume: 100 }
                    ],
                    [
                        { id: 'generatorA', volume: 100 },
                        { id: 'generatorB', volume: 99 }
                    ]
                ]
            });

            expect(result.matches).toHaveLength(6);
            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 34
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 33
            });
            expect(result.matches[2]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorA' }],
                volume: 33
            });
            expect(result.matches[3]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorB' }],
                volume: 33
            });
            expect(result.matches[4]).toEqual({
                entities: [{ id: 'consumerC' }, { id: 'generatorA' }],
                volume: 33
            });
            expect(result.matches[5]).toEqual({
                entities: [{ id: 'consumerC' }, { id: 'generatorB' }],
                volume: 33
            });

            // leftover consumptions
            expect(result.leftoverEntities[0][0]).toEqual({
                id: 'consumerA',
                volume: 33
            });
            expect(result.leftoverEntities[0][1]).toEqual({
                id: 'consumerB',
                volume: 34
            });
            expect(result.leftoverEntities[0][2]).toEqual({
                id: 'consumerC',
                volume: 34
            });

            // excess generations
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 0
            });
            expect(result.leftoverEntities[1][1]).toEqual({
                id: 'generatorB',
                volume: 0
            });
        });

        it('3 consumers within same group - should distribute last indivisible generation (2) from different generators to first consumer', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        {
                            id: 'consumerA',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        },
                        {
                            id: 'consumerB',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        },
                        {
                            id: 'consumerC',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        }
                    ]
                ],
                entityGroups: [
                    [
                        { id: 'consumerA', volume: 100 },
                        { id: 'consumerB', volume: 100 },
                        { id: 'consumerC', volume: 100 }
                    ],
                    [
                        { id: 'generatorA', volume: 100 },
                        { id: 'generatorB', volume: 100 }
                    ]
                ]
            });

            expect(result.matches).toHaveLength(6);
            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 34
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 34
            });
            // It's getting unequally distributed and provided to consumerA,
            // because the distribution happens on two generations (1 generation on each generator)
            // which means that it happens in two separate and independent rounds
            // and in case of 1 generation left - it's distributed to first consumer on list

            expect(result.matches[2]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorA' }],
                volume: 33
            });
            expect(result.matches[3]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorB' }],
                volume: 33
            });
            expect(result.matches[4]).toEqual({
                entities: [{ id: 'consumerC' }, { id: 'generatorA' }],
                volume: 33
            });
            expect(result.matches[5]).toEqual({
                entities: [{ id: 'consumerC' }, { id: 'generatorB' }],
                volume: 33
            });

            // leftover consumptions
            expect(result.leftoverEntities[0][0]).toEqual({
                id: 'consumerA',
                volume: 32
            });
            expect(result.leftoverEntities[0][1]).toEqual({
                id: 'consumerB',
                volume: 34
            });
            expect(result.leftoverEntities[0][2]).toEqual({
                id: 'consumerC',
                volume: 34
            });

            // excess generations
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 0
            });
            expect(result.leftoverEntities[1][1]).toEqual({
                id: 'generatorB',
                volume: 0
            });
        });

        it('2 consumers within different groups - should satisfy higher priority group first', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        {
                            id: 'consumerA',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        }
                    ],
                    [
                        {
                            id: 'consumerB',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        }
                    ]
                ],
                entityGroups: [
                    [
                        { id: 'consumerA', volume: 150 },
                        { id: 'consumerB', volume: 100 }
                    ],
                    [
                        { id: 'generatorA', volume: 100 },
                        { id: 'generatorB', volume: 100 }
                    ]
                ]
            });

            expect(result.matches).toHaveLength(4);
            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 75
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 75
            });
            expect(result.matches[2]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorA' }],
                volume: 25
            });
            expect(result.matches[3]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorB' }],
                volume: 25
            });

            // leftover consumptions
            expect(result.leftoverEntities[0][0]).toEqual({
                id: 'consumerA',
                volume: 0
            });

            expect(result.leftoverEntities[0][1]).toEqual({
                id: 'consumerB',
                volume: 50
            });

            // excess generations
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 0
            });
            expect(result.leftoverEntities[1][1]).toEqual({
                id: 'generatorB',
                volume: 0
            });
        });

        it('2 consumer priority groups, 2 consumer each - should satisfy higher priority group first', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        {
                            id: 'consumerA',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        },
                        {
                            id: 'consumerB',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        }
                    ],
                    [
                        {
                            id: 'consumerC',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        },
                        {
                            id: 'consumerD',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        }
                    ]
                ],
                entityGroups: [
                    [
                        { id: 'consumerA', volume: 100 },
                        { id: 'consumerB', volume: 100 },
                        { id: 'consumerC', volume: 100 },
                        { id: 'consumerD', volume: 100 }
                    ],
                    [
                        { id: 'generatorA', volume: 150 },
                        { id: 'generatorB', volume: 150 }
                    ]
                ]
            });

            // expect(result.matches).toHaveLength(4);
            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 50
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 50
            });
            expect(result.matches[2]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorA' }],
                volume: 50
            });
            expect(result.matches[3]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorB' }],
                volume: 50
            });
            expect(result.matches[4]).toEqual({
                entities: [{ id: 'consumerC' }, { id: 'generatorA' }],
                volume: 25
            });
            expect(result.matches[5]).toEqual({
                entities: [{ id: 'consumerC' }, { id: 'generatorB' }],
                volume: 25
            });
            expect(result.matches[6]).toEqual({
                entities: [{ id: 'consumerD' }, { id: 'generatorA' }],
                volume: 25
            });
            expect(result.matches[7]).toEqual({
                entities: [{ id: 'consumerD' }, { id: 'generatorB' }],
                volume: 25
            });

            // leftover consumptions
            expect(result.leftoverEntities[0][0]).toEqual({
                id: 'consumerA',
                volume: 0
            });

            expect(result.leftoverEntities[0][1]).toEqual({
                id: 'consumerB',
                volume: 0
            });
            expect(result.leftoverEntities[0][2]).toEqual({
                id: 'consumerC',
                volume: 50
            });

            expect(result.leftoverEntities[0][3]).toEqual({
                id: 'consumerD',
                volume: 50
            });

            // excess generations
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 0
            });
            expect(result.leftoverEntities[1][1]).toEqual({
                id: 'generatorB',
                volume: 0
            });
        });
        // consumer priority end
    });

    describe('generator priority', () => {
        it('2 generators - should distribute evenly between same priority generators', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        {
                            id: 'consumerA',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        }
                    ]
                ],
                entityGroups: [
                    [{ id: 'consumerA', volume: 100 }],
                    [
                        { id: 'generatorA', volume: 50 },
                        { id: 'generatorB', volume: 150 }
                    ]
                ]
            });

            expect(result.matches).toHaveLength(2);
            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 50
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 50
            });

            // leftover consumptions
            expect(result.leftoverEntities[0][0]).toEqual({
                id: 'consumerA',
                volume: 0
            });

            // excess generations
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 0
            });
            expect(result.leftoverEntities[1][1]).toEqual({
                id: 'generatorB',
                volume: 100
            });
        });

        it('2 generators - should distribute last indivisible consumption (1) from first generation on list', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        {
                            id: 'consumerA',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        }
                    ]
                ],
                entityGroups: [
                    [{ id: 'consumerA', volume: 51 }],
                    [
                        { id: 'generatorA', volume: 50 },
                        { id: 'generatorB', volume: 50 }
                    ]
                ]
            });

            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 26
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 25
            });
        });

        it('3 generators - should distribute evenly between same priority generators', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        {
                            id: 'consumerA',
                            groupPriority: [
                                [{ id: 'generatorA' }, { id: 'generatorB' }, { id: 'generatorC' }]
                            ]
                        }
                    ]
                ],
                entityGroups: [
                    [{ id: 'consumerA', volume: 120 }],
                    [
                        { id: 'generatorA', volume: 60 },
                        { id: 'generatorB', volume: 60 },
                        { id: 'generatorC', volume: 60 }
                    ]
                ]
            });

            expect(result.matches).toHaveLength(3);
            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 40
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 40
            });
            expect(result.matches[2]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorC' }],
                volume: 40
            });

            // leftover consumptions
            expect(result.leftoverEntities[0][0]).toEqual({
                id: 'consumerA',
                volume: 0
            });

            // excess generations
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 20
            });
            expect(result.leftoverEntities[1][1]).toEqual({
                id: 'generatorB',
                volume: 20
            });
            expect(result.leftoverEntities[1][2]).toEqual({
                id: 'generatorC',
                volume: 20
            });
        });

        it('3 generators - should distribute last indivisible consumption (1) from first generation on list', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        {
                            id: 'consumerA',
                            groupPriority: [
                                [{ id: 'generatorA' }, { id: 'generatorB' }, { id: 'generatorC' }]
                            ]
                        }
                    ]
                ],
                entityGroups: [
                    [{ id: 'consumerA', volume: 100 }],
                    [
                        { id: 'generatorA', volume: 50 },
                        { id: 'generatorB', volume: 50 },
                        { id: 'generatorC', volume: 50 }
                    ]
                ]
            });

            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 34
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 33
            });
            expect(result.matches[2]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorC' }],
                volume: 33
            });

            // leftover consumptions
            expect(result.leftoverEntities[0][0]).toEqual({
                id: 'consumerA',
                volume: 0
            });

            // excess generations
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 16
            });
            expect(result.leftoverEntities[1][1]).toEqual({
                id: 'generatorB',
                volume: 17
            });
            expect(result.leftoverEntities[1][2]).toEqual({
                id: 'generatorC',
                volume: 17
            });
        });

        it('3 generators - should distribute last indivisible consumption (2) from first two generations on list', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        {
                            id: 'consumerA',
                            groupPriority: [
                                [{ id: 'generatorA' }, { id: 'generatorB' }, { id: 'generatorC' }]
                            ]
                        }
                    ]
                ],
                entityGroups: [
                    [{ id: 'consumerA', volume: 101 }],
                    [
                        { id: 'generatorA', volume: 50 },
                        { id: 'generatorB', volume: 50 },
                        { id: 'generatorC', volume: 50 }
                    ]
                ]
            });

            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 34
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 34
            });
            expect(result.matches[2]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorC' }],
                volume: 33
            });

            // leftover consumptions
            expect(result.leftoverEntities[0][0]).toEqual({
                id: 'consumerA',
                volume: 0
            });

            // excess generations
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 16
            });
            expect(result.leftoverEntities[1][1]).toEqual({
                id: 'generatorB',
                volume: 16
            });
            expect(result.leftoverEntities[1][2]).toEqual({
                id: 'generatorC',
                volume: 17
            });
        });

        it('2 generators and 2 consumers - should distribute evenly between same priority generators', () => {
            const result = integerMatcher({
                groupPriority: [
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
                ],
                entityGroups: [
                    [
                        { id: 'consumerA', volume: 50 },
                        { id: 'consumerB', volume: 50 }
                    ],
                    [
                        { id: 'generatorA', volume: 50 },
                        { id: 'generatorB', volume: 50 }
                    ]
                ]
            });

            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 25
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 25
            });
            expect(result.matches[2]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorA' }],
                volume: 25
            });
            expect(result.matches[3]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorB' }],
                volume: 25
            });
        });

        it('3 generators and 2 consumers - should distribute evenly between same priority generators', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        {
                            id: 'consumerA',
                            groupPriority: [
                                [{ id: 'generatorA' }, { id: 'generatorB' }, { id: 'generatorC' }]
                            ]
                        },
                        {
                            id: 'consumerB',
                            groupPriority: [
                                [{ id: 'generatorA' }, { id: 'generatorB' }, { id: 'generatorC' }]
                            ]
                        }
                    ]
                ],
                entityGroups: [
                    [
                        { id: 'consumerA', volume: 30 },
                        { id: 'consumerB', volume: 30 }
                    ],
                    [
                        { id: 'generatorA', volume: 20 },
                        { id: 'generatorB', volume: 20 },
                        { id: 'generatorC', volume: 20 }
                    ]
                ]
            });

            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 10
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 10
            });
            expect(result.matches[2]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorC' }],
                volume: 10
            });
            expect(result.matches[3]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorA' }],
                volume: 10
            });
            expect(result.matches[4]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorB' }],
                volume: 10
            });
            expect(result.matches[5]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorC' }],
                volume: 10
            });
        });

        it('2 generators and 3 consumers - should distribute evenly between same priority generators', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        {
                            id: 'consumerA',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        },
                        {
                            id: 'consumerB',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        },
                        {
                            id: 'consumerC',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        }
                    ]
                ],
                entityGroups: [
                    [
                        { id: 'consumerA', volume: 10 },
                        { id: 'consumerB', volume: 10 },
                        { id: 'consumerC', volume: 10 }
                    ],
                    [
                        { id: 'generatorA', volume: 20 },
                        { id: 'generatorB', volume: 20 }
                    ]
                ]
            });

            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 5
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorB' }],
                volume: 5
            });
            expect(result.matches[2]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorA' }],
                volume: 5
            });
            expect(result.matches[3]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorB' }],
                volume: 5
            });
            expect(result.matches[4]).toEqual({
                entities: [{ id: 'consumerC' }, { id: 'generatorA' }],
                volume: 5
            });
            expect(result.matches[5]).toEqual({
                entities: [{ id: 'consumerC' }, { id: 'generatorB' }],
                volume: 5
            });

            // excess generations
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 5
            });
            expect(result.leftoverEntities[1][1]).toEqual({
                id: 'generatorB',
                volume: 5
            });
        });
        // generator priority end
    });

    describe('leftover consumptions', () => {
        it('should return only leftover consumptions when there are no generations', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        {
                            id: 'consumerA',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        },
                        {
                            id: 'consumerB',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        },
                        {
                            id: 'consumerC',
                            groupPriority: [[{ id: 'generatorA' }, { id: 'generatorB' }]]
                        }
                    ]
                ],
                entityGroups: [
                    [
                        { id: 'consumerA', volume: 10 },
                        { id: 'consumerB', volume: 10 },
                        { id: 'consumerC', volume: 10 }
                    ],
                    []
                ]
            });

            expect(result.matches).toHaveLength(0);
            expect(result.leftoverEntities[0][0]).toEqual({
                id: 'consumerA',
                volume: 10
            });
            expect(result.leftoverEntities[0][1]).toEqual({
                id: 'consumerB',
                volume: 10
            });
            expect(result.leftoverEntities[0][2]).toEqual({
                id: 'consumerC',
                volume: 10
            });
        });

        it('should return leftover consumptions when the generations cannot satisfy all consumptions', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        { id: 'consumerA', groupPriority: [[{ id: 'generatorA' }]] },
                        { id: 'consumerB', groupPriority: [[{ id: 'generatorA' }]] }
                    ]
                ],
                entityGroups: [
                    [
                        { id: 'consumerA', volume: 10 },
                        { id: 'consumerB', volume: 10 }
                    ],
                    [{ id: 'generatorA', volume: 10 }]
                ]
            });

            expect(result.matches).toHaveLength(2);
            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 5
            });
            expect(result.matches[1]).toEqual({
                entities: [{ id: 'consumerB' }, { id: 'generatorA' }],
                volume: 5
            });

            expect(result.leftoverEntities[0][0]).toEqual({
                id: 'consumerA',
                volume: 5
            });
            expect(result.leftoverEntities[0][1]).toEqual({
                id: 'consumerB',
                volume: 5
            });
        });
        // leftover consumptions end
    });

    describe('excess generations', () => {
        it('should return only excess generations when there are no consumptions to satisfy', () => {
            const result = integerMatcher({
                groupPriority: [
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
                ],
                entityGroups: [[], [{ id: 'generatorA', volume: 10 }]]
            });

            expect(result.matches).toHaveLength(0);
            expect(result.leftoverEntities[0]).toHaveLength(0);
            expect(result.leftoverEntities[1]).toHaveLength(1);
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 10
            });
        });

        it('should return excess generations when the consumptions are satisfied and there are generations left', () => {
            const result = integerMatcher({
                groupPriority: [
                    [
                        { id: 'consumerA', groupPriority: [[{ id: 'generatorA' }]] },
                        { id: 'consumerB', groupPriority: [[{ id: 'generatorA' }]] }
                    ]
                ],
                entityGroups: [[{ id: 'consumerA', volume: 5 }], [{ id: 'generatorA', volume: 10 }]]
            });

            expect(result.matches).toHaveLength(1);
            expect(result.matches[0]).toEqual({
                entities: [{ id: 'consumerA' }, { id: 'generatorA' }],
                volume: 5
            });

            expect(result.leftoverEntities[1]).toHaveLength(1);
            expect(result.leftoverEntities[1][0]).toEqual({
                id: 'generatorA',
                volume: 5
            });
        });
        // excess generations end
    });

    describe('Custom data', () => {
        it('returns entities custom data in match result', () => {
            const result = SpreadMatcher.spreadMatcher({
                groupPriority: [
                    [
                        { id: 'consumerA', groupPriority: [[{ id: 'generatorA' }]] },
                        { id: 'consumerB', groupPriority: [[{ id: 'generatorA' }]] }
                    ]
                ],
                entityGroups: [
                    [{ id: 'consumerA', volume: BigNumber.from(5), type: 'consumer' }],
                    [{ id: 'generatorA', volume: BigNumber.from(10), type: 'generator' }]
                ]
            });

            expect(result.matches).toHaveLength(1);
            expect(result.matches[0]).toEqual({
                entities: [
                    { id: 'consumerA', type: 'consumer' },
                    { id: 'generatorA', type: 'generator' }
                ],
                volume: BigNumber.from(5)
            });
        });

        it('does not collide on id duplicates', () => {
            const result = SpreadMatcher.spreadMatcher({
                groupPriority: [
                    [
                        { id: 'consumerA', groupPriority: [[{ id: 'generatorA' }]] },
                        { id: 'consumerB', groupPriority: [[{ id: 'generatorA' }]] }
                    ]
                ],
                entityGroups: [
                    [
                        { id: 'consumerA', volume: BigNumber.from(6), type: 'consumer' },
                        { id: 'consumerA', volume: BigNumber.from(6), type: 'battery' }
                    ],
                    [
                        { id: 'generatorA', volume: BigNumber.from(10), type: 'generator' },
                        { id: 'generatorA', volume: BigNumber.from(10), type: 'battery' }
                    ]
                ]
            });

            expect(result.matches).toHaveLength(4);
            expect(result.matches[0]).toEqual({
                entities: [
                    { id: 'consumerA', type: 'consumer' },
                    { id: 'generatorA', type: 'generator' }
                ],
                volume: BigNumber.from(3)
            });
            expect(result.matches[1]).toEqual({
                entities: [
                    { id: 'consumerA', type: 'consumer' },
                    { id: 'generatorA', type: 'battery' }
                ],
                volume: BigNumber.from(3)
            });
            expect(result.matches[2]).toEqual({
                entities: [
                    { id: 'consumerA', type: 'battery' },
                    { id: 'generatorA', type: 'generator' }
                ],
                volume: BigNumber.from(3)
            });
            expect(result.matches[3]).toEqual({
                entities: [
                    { id: 'consumerA', type: 'battery' },
                    { id: 'generatorA', type: 'battery' }
                ],
                volume: BigNumber.from(3)
            });
        });
    });

    describe('Missing generator priorities', () => {
        it('Skips generators not in group', () => {
            const result = SpreadMatcher.spreadMatcher({
                groupPriority: [[{ id: 'consumerA', groupPriority: [[{ id: 'generatorA' }]] }]],
                entityGroups: [
                    [{ id: 'consumerA', volume: BigNumber.from(50) }],
                    [{ id: 'generatorB', volume: BigNumber.from(30) }]
                ]
            });

            expect(result.matches).toHaveLength(0);
        });
    });

    it('Edge case - small distribution divided by not-competing consumers', () => {
        // **Original problem**: first match is edge case, therefore A gets value from X
        // and B gets nothing. In second round A again receives one energy AGAIN.
        // If generators were not divided by all consumers, but only consumers from routes
        // then first round would assign one energy to both A and B.
        // This results also in many many more matching rounds done, due to unnecessary splits.

        const result = SpreadMatcher.spreadMatcher({
            groupPriority: [
                [
                    {
                        id: 'consumerA',
                        groupPriority: [[{ id: 'generatorX' }], [{ id: 'generatorY' }]]
                    },
                    { id: 'consumerB', groupPriority: [[{ id: 'generatorY' }]] }
                ]
            ],
            entityGroups: [
                [
                    { id: 'consumerA', volume: BigNumber.from(10) },
                    { id: 'consumerB', volume: BigNumber.from(10) }
                ],
                [
                    { id: 'generatorX', volume: BigNumber.from(1) },
                    { id: 'generatorY', volume: BigNumber.from(1) }
                ]
            ]
        });

        expect(result.matches).toHaveLength(2);

        expect(result.matches[0]).toEqual({
            entities: [{ id: 'consumerA' }, { id: 'generatorX' }],
            volume: BigNumber.from(1)
        });
        expect(result.matches[1]).toEqual({
            entities: [{ id: 'consumerB' }, { id: 'generatorY' }],
            volume: BigNumber.from(1)
        });
    });
});

type Primitive = string | number | boolean | undefined | null;
type IntegerVolume<T> = {
    [K in keyof T]: T[K] extends BigNumber
        ? number
        : T[K] extends Primitive
        ? T[K]
        : IntegerVolume<T[K]>;
};

const integerMatcher = <T extends SpreadMatcher.Entity, P extends SpreadMatcher.Entity>(
    params: IntegerVolume<SpreadMatcher.Params<T, P>>
): IntegerVolume<SpreadMatcher.Result<T, P>> => {
    const result = SpreadMatcher.spreadMatcher({
        groupPriority: params.groupPriority,
        entityGroups: params.entityGroups.map((g) =>
            g.map((e) => ({
                id: e.id,
                volume: BigNumber.from(e.volume)
            }))
        ) as [SpreadMatcher.Entity[], SpreadMatcher.Entity[]]
    });

    return {
        leftoverEntities: result.leftoverEntities.map((g) =>
            g.map((e) => ({
                id: e.id,
                volume: e.volume.toNumber()
            }))
        ) as any,
        matches: result.matches.map((m) => ({
            ...m,
            volume: m.volume.toNumber()
        })) as any,
        roundMatches: result.roundMatches.map((round) =>
            round.map((m) => ({
                ...m,
                volume: m.volume.toNumber()
            }))
        ) as any
    };
};
