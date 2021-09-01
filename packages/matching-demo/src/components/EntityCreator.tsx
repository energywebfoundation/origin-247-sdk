import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { fromPairs } from 'lodash';
import { BigNumber } from '@ethersproject/bignumber';

interface IProps {
    entityType: 'consumer' | 'generator';
    onChange: (entities: { id: string; volume: BigNumber }[]) => void;
}

const entitiesKeys = {
    consumer: ['A', 'B', 'C', 'D'],
    generator: ['V', 'X', 'Y', 'Z']
};

export function EntityCreator(props: IProps) {
    const { entityType, onChange } = props;

    const [entities, setEntities] = useState(
        fromPairs(
            entitiesKeys[entityType].map((key) => [`${entityType}${key}`, 0] as [string, number])
        )
    );

    useEffect(() => {
        const mapped = Object.entries(entities)
            .filter(([id, volume]) => volume > 0)
            .map(([id, volume]) => ({
                id,
                volume: BigNumber.from(volume)
            }));

        onChange(mapped);
    }, [entities]);

    return (
        <Grid container spacing={2}>
            {Object.entries(entities).map(([entityId, volume]) => (
                <Grid item xs key={entityId}>
                    <TextField
                        label={entityId}
                        variant="standard"
                        value={volume}
                        onChange={(e) =>
                            setEntities({
                                ...entities,
                                [entityId]: isNaN(Number(e.target.value))
                                    ? 0
                                    : Number(e.target.value)
                            })
                        }
                    />
                </Grid>
            ))}
        </Grid>
    );
}
