import { BigNumber } from '@ethersproject/bignumber';
import React from 'react';
import { Match } from '../types';
import { bigNumSumBy } from '../utils';
import { groupBy } from 'lodash';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import './MatchRound.css';

interface IProps {
    allMatches: Match[];
    roundMatches: Match[];
    round: number;
    consumption: { id: string; volume: BigNumber }[];
    generation: { id: string; volume: BigNumber }[];
}

export function MatchRound(props: IProps) {
    const { allMatches, consumption, generation, round, roundMatches } = props;

    const getMatchValue = (generatorId: string, consumerId: string) => {
        const filteredMatches = allMatches.filter(
            (m: Match) => m.entities[0].id === consumerId && m.entities[1].id === generatorId
        );

        return bigNumSumBy(filteredMatches, 'volume');
    };

    const getRoundMatch = (generatorId: string, consumerId: string) => {
        return roundMatches.find(
            (m: Match) => m.entities[0].id === consumerId && m.entities[1].id === generatorId
        );
    };

    const matchesByConsumer = groupBy(allMatches, (m) => m.entities[0].id);
    const matchesByGenerator = groupBy(allMatches, (m) => m.entities[1].id);

    const printMatchCell = (generatorId: string, consumerId: string) => {
        const roundMatch = getRoundMatch(generatorId, consumerId);
        const matchValue = getMatchValue(generatorId, consumerId);

        if (roundMatch) {
            return (
                <>
                    <span className="c-match-round_cell-value">{matchValue.toString()}</span> (
                    <span className="c-match-round_cell-value">
                        {matchValue.sub(roundMatch.volume).toString()}
                    </span>{' '}
                    <span className="c-match-round_cell-value is-updated">
                        + {roundMatch.volume.toString()}
                    </span>
                    )
                </>
            );
        }

        return <span className="c-match-round_cell-value">{matchValue.toString()}</span>;
    };

    return (
        <TableContainer component={Paper} className="c-match-round">
            <Table sx={{ minWidth: 650 }} size="small">
                <caption>Round {round}</caption>
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        {consumption.map((consumer) => (
                            <TableCell key={consumer.id}>
                                {consumer.id} (
                                {consumer.volume
                                    .sub(
                                        bigNumSumBy(matchesByConsumer[consumer.id] ?? [], 'volume')
                                    )
                                    .toString()}
                                )
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {generation.map((generator) => (
                        <TableRow key={generator.id}>
                            <TableCell component="th" scope="row">
                                {generator.id} (
                                {generator.volume
                                    .sub(
                                        bigNumSumBy(
                                            matchesByGenerator[generator.id] ?? [],
                                            'volume'
                                        )
                                    )
                                    .toString()}
                                )
                            </TableCell>
                            {consumption.map((consumer) => (
                                <TableCell key={generator.id + consumer.id}>
                                    {printMatchCell(generator.id, consumer.id)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
