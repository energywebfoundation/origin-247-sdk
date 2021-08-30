import Radio from '@material-ui/core/Radio';
import React from 'react';
import { times } from 'lodash';

interface IRadioRowProps {
    idPrefix: string;
    id: string;
    priorityMap: Record<string, number>;
    onChange: (p: Record<string, number>) => void;
    color: 'primary' | 'secondary';
}

export function RadioRow(props: IRadioRowProps) {
    const { idPrefix, id, priorityMap, onChange, color } = props;

    return (
        <div>
            {id}
            {times(5, (
                i // setting priority as 4 (last) will effectively disable generator from being used
            ) => (
                <Radio
                    key={idPrefix + id + i}
                    name={idPrefix + id + i}
                    checked={priorityMap[id] === i}
                    onChange={() =>
                        onChange({
                            ...priorityMap,
                            [id]: i
                        })
                    }
                    value={i}
                    color={i === 4 ? 'error' : color}
                />
            ))}
        </div>
    );
}
