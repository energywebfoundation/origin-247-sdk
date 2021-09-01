import { entries, times } from 'lodash';
import React, { useEffect, useState } from 'react';
import { IPriority } from '../types';
import { fromPairs } from 'lodash';
import { RadioRow } from './PriorityRadioGroup';
import './PriorityConfigurator.css';

interface IProps {
    consumers: string[];
    generators: string[];
    onChange: (priority: IPriority[][]) => void;
}

export function PriorityConfigurator(props: IProps) {
    const { consumers, generators, onChange } = props;

    const [consumerPriority, setConsumerPriority] = useState({} as Record<string, number>);
    const [generatorPriority, setGeneratorPriority] = useState(
        {} as Record<string, Record<string, number>>
    );

    useEffect(() => {
        setConsumerPriority(buildPriorityMap(consumers));
        setGeneratorPriority(fromPairs(consumers.map((c, i) => [c, buildPriorityMap(generators)])));
    }, [consumers.join(','), generators.join(',')]);

    useEffect(() => {
        onChange(
            buildPriorityGroup(consumerPriority).map((group) =>
                group.map((item) => ({
                    ...item,
                    groupPriority: buildPriorityGroup(generatorPriority[item.id])
                }))
            )
        );
    }, [consumerPriority, generatorPriority]);

    return (
        <>
            Select last generator if you want to disable it for given customer. Priorities are
            sorted from highest to lowest.
            {consumers.map((consumerId) => (
                <div key={consumerId}>
                    <RadioRow
                        idPrefix=""
                        id={consumerId}
                        priorityMap={consumerPriority}
                        onChange={setConsumerPriority}
                        color="primary"
                    />
                    <div className="c-priority-configurator_generator-list">
                        {generators.map((generatorId) => (
                            <RadioRow
                                idPrefix={consumerId}
                                id={generatorId}
                                priorityMap={generatorPriority[consumerId] ?? {}}
                                onChange={(priority) =>
                                    setGeneratorPriority({
                                        ...generatorPriority,
                                        [consumerId]: priority
                                    })
                                }
                                color="secondary"
                                key={consumerId + generatorId}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </>
    );
}

const buildPriorityMap = (entities: string[]) => fromPairs(entities.map((c, i) => [c, i]));

const buildPriorityGroup = (priorityMap: Record<string, number>) =>
    times(4, (priorityLevel) => {
        const entityIds = entries(priorityMap)
            .filter(([_, p]) => p === priorityLevel)
            .map(([id, _]) => id);

        return entityIds.map((generatorId) => ({ id: generatorId }));
    });
