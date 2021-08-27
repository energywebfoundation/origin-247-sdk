import { BigNumber } from 'ethers';
import { first, last, orderBy } from 'lodash';
import { Interval } from 'luxon';
import { bigNumAvg, bigNumSum } from './bigNumber';
import { Duration } from './Duration';

interface IAggregateCommand {
    data: { time: Date; value: BigNumber }[];
    start?: Date;
    end?: Date;
    method: AggregateMethod;
    window: Duration;
    timezoneOffset: number /** in minutes */;
}

export interface IAggregateResult {
    start: Date;
    end: Date;
    value: BigNumber;
}

export enum AggregateMethod {
    Avg = 'avg',
    Sum = 'sum'
}

const buildAggregateFrames = ({
    data,
    window,
    start,
    end
}: IAggregateCommand): { start: Date; end: Date }[] => {
    if (data.length === 0 && (!start || !end)) {
        // For this case we don't know anything how to build frames,
        // so return nothing
        return [];
    }
    const intervalStart = start ?? first(data)!.time;
    const intervalEnd = end ?? last(data)?.time ?? new Date();

    const intervalStartRounded = new Date(window.roundDate(intervalStart));

    const intervals = Interval.fromDateTimes(intervalStartRounded, intervalEnd).splitBy(
        window.toLuxonDuration()
    );

    return intervals.map((interval, i) => ({
        start: i === 0 ? intervalStart : interval.start.toJSDate(),
        end: interval.end.toJSDate()
    }));
};

const offsetByTimezone = (command: IAggregateCommand): IAggregateCommand => {
    const { start, end, data, ...rest } = command;

    if (command.timezoneOffset === 0) {
        return command;
    }

    const milisOffset = command.timezoneOffset * 60 * 1000;

    return {
        start: start ? new Date(start.getTime() - milisOffset) : undefined,
        end: end ? new Date(end.getTime() - milisOffset) : undefined,
        data: data.map((d) => ({
            ...d,
            time: new Date(d.time.getTime() - milisOffset)
        })),
        ...rest
    };
};

export const aggregate = ({
    data,
    method,
    window,
    start,
    end,
    timezoneOffset
}: IAggregateCommand): IAggregateResult[] => {
    const aggregateFunction = method === 'sum' ? bigNumSum : bigNumAvg;
    const sortedData = orderBy(data, [(e) => e.time], 'asc');
    const offsettedCommand = offsetByTimezone({
        data: sortedData,
        method,
        window,
        start,
        end,
        timezoneOffset
    });
    const intervals = buildAggregateFrames(offsettedCommand);

    return intervals
        .map((interval, intervalN) => {
            const resultsInInterval = offsettedCommand.data.filter(
                (r, dataN) =>
                    (r.time > interval.start && r.time <= interval.end) ||
                    // because of `>` condition first value in dataset won't be included
                    // even if first interval `start` was generated out of this value time
                    (start === undefined && intervalN === 0 && dataN === 0)
            );
            return {
                start: interval.start,
                end: interval.end,
                results: resultsInInterval.map((r) => r.value)
            };
        })
        .map((e) => ({
            start: e.start,
            end: e.end,
            value: aggregateFunction(e.results)
        }));
};
