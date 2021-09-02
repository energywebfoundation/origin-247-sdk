import React, { useState } from 'react';
import { SpreadMatcher } from '@energyweb/origin-247-claim/dist/js/src/algorithms';
import { BigNumber } from '@ethersproject/bignumber';
import { MatchRound } from './components/MatchRound';
import { EntityCreator } from './components/EntityCreator';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { PriorityConfigurator } from './components/PriorityConfigurator';
import { IPriority } from './types';
import './App.css';

export function App() {
    const [consumers, setConsumers] = useState([] as { id: string; volume: BigNumber }[]);
    const [generators, setGenerators] = useState([] as { id: string; volume: BigNumber }[]);
    const [priority, setPriority] = useState([] as IPriority[][]);

    const { roundMatches } = SpreadMatcher.spreadMatcher({
        groupPriority: priority,
        entityGroups: [consumers, generators]
    });

    return (
        <Container maxWidth="md" className="c-app">
            <Typography variant="h5" component="h3" className="c-header">
                Consumers
            </Typography>
            <EntityCreator entityType="consumer" onChange={setConsumers} />

            <Typography variant="h5" component="h3" className="c-header">
                Generators
            </Typography>
            <EntityCreator entityType="generator" onChange={setGenerators} />

            <Typography variant="h5" component="h3" className="c-header">
                Priority configuration
            </Typography>
            <PriorityConfigurator
                consumers={consumers.map((c) => c.id)}
                generators={generators.map((g) => g.id)}
                onChange={setPriority}
            />

            <Typography variant="h5" component="h3" className="c-header">
                Matching rounds
            </Typography>
            {roundMatches.length === 0 && 'No matches'}
            {roundMatches.map((_, i) => (
                <MatchRound
                    consumption={consumers}
                    generation={generators}
                    allMatches={roundMatches.slice(0, i + 1).flat()}
                    roundMatches={roundMatches[i]}
                    round={i + 1}
                    key={i}
                />
            ))}
        </Container>
    );
}
