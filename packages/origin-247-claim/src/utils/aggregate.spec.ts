import { BigNumber } from '@ethersproject/bignumber';
import { Duration } from './Duration';
import { aggregate, AggregateMethod } from './aggregate';

describe('aggregate function', () => {
    it('should aggregate data within given timeframe only', () => {
        const aggregateOptionsOneHour = {
            start: new Date('2021-05-13T08:00:00.000Z'),
            end: new Date('2021-05-13T09:00:00.000Z'),
            method: AggregateMethod.Sum,
            window: new Duration('15m'),
            timezoneOffset: 0
        };
        let aggregated = aggregate({
            data: data,
            ...aggregateOptionsOneHour
        });
        expect(aggregated).toHaveLength(4);
        const aggregateOptionsTwoHours = {
            start: new Date('2021-05-13T08:00:00.000Z'),
            end: new Date('2021-05-13T10:00:00.000Z'),
            method: AggregateMethod.Sum,
            window: new Duration('15m'),
            timezoneOffset: 0
        };
        aggregated = aggregate({
            data: data,
            ...aggregateOptionsTwoHours
        });
        expect(aggregated).toHaveLength(8);
    });

    it('should aggregate data to 15m window', () => {
        const aggregateOptions15minWindow = {
            start: new Date('2021-05-13T08:00:00.000Z'),
            end: new Date('2021-05-13T10:00:00.000Z'),
            method: AggregateMethod.Sum,
            window: new Duration('15m'),
            timezoneOffset: 0
        };
        const aggregated = aggregate({
            data: data,
            ...aggregateOptions15minWindow
        });
        expect(aggregated).toHaveLength(8);
    });

    it('should aggregate data to 1h window', () => {
        const aggregateOptions1hWindow = {
            start: new Date('2021-05-13T08:00:00.000Z'),
            end: new Date('2021-05-13T10:00:00.000Z'),
            method: AggregateMethod.Sum,
            window: new Duration('1h'),
            timezoneOffset: 0
        };
        const aggregated = aggregate({
            data: data,
            ...aggregateOptions1hWindow
        });
        expect(aggregated).toHaveLength(2);
    });

    it('should aggregate data to 2h window', () => {
        const aggregateOptions1hWindow = {
            start: new Date('2021-05-13T08:00:00.000Z'),
            end: new Date('2021-05-13T10:00:00.000Z'),
            method: AggregateMethod.Sum,
            window: new Duration('2h'),
            timezoneOffset: 0
        };
        const aggregated = aggregate({
            data: data,
            ...aggregateOptions1hWindow
        });
        expect(aggregated).toHaveLength(1);
    });

    it('should aggregate data to 1d window', () => {
        const aggregateOptions1hWindow = {
            start: new Date('2021-05-13T08:00:00.000Z'),
            end: new Date('2021-05-15T10:00:00.000Z'),
            method: AggregateMethod.Sum,
            window: new Duration('1d'),
            timezoneOffset: 0
        };
        const aggregated = aggregate({
            data: data,
            ...aggregateOptions1hWindow
        });
        expect(aggregated).toHaveLength(3);
    });

    it('should aggregate data to 1 month window', () => {
        const aggregateOptions1hWindow = {
            start: new Date('2021-05-13T08:00:00.000Z'),
            end: new Date('2021-07-15T10:00:00.000Z'),
            method: AggregateMethod.Sum,
            window: new Duration('1mo'),
            timezoneOffset: 0
        };
        const aggregated = aggregate({
            data: data,
            ...aggregateOptions1hWindow
        });
        expect(aggregated).toHaveLength(3);
        expect(aggregated[0].value.toNumber()).toEqual(1900);
        expect(aggregated[1].value.toNumber()).toEqual(1000);
        expect(aggregated[2].value.toNumber()).toEqual(0);
    });

    it('should aggregate data with sum method - 1h window', () => {
        const aggregateOptionsSum = {
            start: new Date('2021-05-13T08:00:00.000Z'),
            end: new Date('2021-05-13T10:00:00.000Z'),
            method: AggregateMethod.Sum,
            window: new Duration('1h'),
            timezoneOffset: 0
        };
        const aggregated = aggregate({
            data: data,
            ...aggregateOptionsSum
        });
        expect(aggregated).toHaveLength(2);
        expect(aggregated[0].value.toNumber()).toEqual(500);
        expect(aggregated[1].value.toNumber()).toEqual(800);
    });

    it('should aggregate data with sum method - 15m window', () => {
        const aggregateOptionsSum = {
            start: new Date('2021-05-13T08:00:00.000Z'),
            end: new Date('2021-05-13T10:00:00.000Z'),
            method: AggregateMethod.Sum,
            window: new Duration('15m'),
            timezoneOffset: 0
        };
        const aggregated = aggregate({
            data: data,
            ...aggregateOptionsSum
        });
        expect(aggregated).toHaveLength(8);
        expect(aggregated[0].value.toNumber()).toEqual(100);
        expect(aggregated[1].value.toNumber()).toEqual(100);
        expect(aggregated[2].value.toNumber()).toEqual(100);
        expect(aggregated[3].value.toNumber()).toEqual(200);
        expect(aggregated[4].value.toNumber()).toEqual(200);
        expect(aggregated[5].value.toNumber()).toEqual(200);
        expect(aggregated[6].value.toNumber()).toEqual(200);
        expect(aggregated[7].value.toNumber()).toEqual(200);
    });

    it('should aggregate data with avg method - 1h window', () => {
        const aggregateOptionsAvg = {
            start: new Date('2021-05-13T08:00:00.000Z'),
            end: new Date('2021-05-13T10:00:00.000Z'),
            method: AggregateMethod.Avg,
            window: new Duration('1h'),
            timezoneOffset: 0
        };
        const aggregated = aggregate({
            data: data,
            ...aggregateOptionsAvg
        });
        expect(aggregated).toHaveLength(2);
        expect(aggregated[0].value.toNumber()).toEqual(125);
        expect(aggregated[1].value.toNumber()).toEqual(200);
    });

    it('should aggregate data with avg method - 15m window', () => {
        const aggregateOptionsAvg = {
            start: new Date('2021-05-13T08:00:00.000Z'),
            end: new Date('2021-05-13T10:00:00.000Z'),
            method: AggregateMethod.Avg,
            window: new Duration('15m'),
            timezoneOffset: 0
        };
        const aggregated = aggregate({
            data: data,
            ...aggregateOptionsAvg
        });
        expect(aggregated).toHaveLength(8);
        expect(aggregated[0].value.toNumber()).toEqual(100);
        expect(aggregated[1].value.toNumber()).toEqual(100);
        expect(aggregated[2].value.toNumber()).toEqual(100);
        expect(aggregated[3].value.toNumber()).toEqual(200);
        expect(aggregated[4].value.toNumber()).toEqual(200);
        expect(aggregated[5].value.toNumber()).toEqual(200);
        expect(aggregated[6].value.toNumber()).toEqual(200);
        expect(aggregated[7].value.toNumber()).toEqual(200);
    });

    it('should aggregate data without start/end date', () => {
        const test = (results: any) => {
            expect(results).toHaveLength(3);
            expect(results[0].value.toNumber()).toEqual(50);
            expect(results[1].value.toNumber()).toEqual(0);
            expect(results[2].value.toNumber()).toEqual(20);
        };

        test(
            aggregate({
                data: data2,
                start: new Date('2021-04-25T06:15:00.000Z'),
                method: AggregateMethod.Sum,
                window: new Duration('1h'),
                timezoneOffset: 0
            })
        );

        test(
            aggregate({
                data: data2,
                end: new Date('2021-04-25T08:45:00.000Z'),
                method: AggregateMethod.Sum,
                window: new Duration('1h'),
                timezoneOffset: 0
            })
        );

        test(
            aggregate({
                data: data2,
                method: AggregateMethod.Sum,
                window: new Duration('1h'),
                timezoneOffset: 0
            })
        );
    });

    it('should correctly aggregate data over midnight with timezone', () => {
        const result = aggregate({
            data: overMidnightData,
            start: new Date('2021-04-25T00:00:00.000+02:00'),
            end: new Date('2021-04-25T18:00:00.000+02:00'),
            method: AggregateMethod.Sum,
            window: new Duration('1d'),
            timezoneOffset: -2 * 60
        });

        expect(result).toHaveLength(1);
        expect(result[0].value.toNumber()).toEqual(200);

        const result2 = aggregate({
            data: overMidnightData,
            start: new Date('2021-04-24T00:00:00.000+02:00'),
            end: new Date('2021-04-25T18:00:00.000+02:00'),
            method: AggregateMethod.Sum,
            window: new Duration('1d'),
            timezoneOffset: -2 * 60
        });

        expect(result2).toHaveLength(2);
        expect(result2[0].value.toNumber()).toEqual(100);
        expect(result2[1].value.toNumber()).toEqual(200);
    });
});

const data = [
    {
        time: new Date('2021-05-13T08:00:00.000Z'),
        value: BigNumber.from(100)
    },
    {
        time: new Date('2021-05-13T08:15:00.000Z'),
        value: BigNumber.from(100)
    },
    {
        time: new Date('2021-05-13T08:30:00.000Z'),
        value: BigNumber.from(100)
    },
    {
        time: new Date('2021-05-13T08:45:00.000Z'),
        value: BigNumber.from(100)
    },
    {
        time: new Date('2021-05-13T09:00:00.000Z'),
        value: BigNumber.from(200)
    },
    {
        time: new Date('2021-05-13T09:15:00.000Z'),
        value: BigNumber.from(200)
    },
    {
        time: new Date('2021-05-13T09:30:00.000Z'),
        value: BigNumber.from(200)
    },
    {
        time: new Date('2021-05-13T09:45:00.000Z'),
        value: BigNumber.from(200)
    },
    {
        time: new Date('2021-05-13T10:00:00.000Z'),
        value: BigNumber.from(200)
    },
    {
        time: new Date('2021-05-14T10:00:00.000Z'),
        value: BigNumber.from(300)
    },
    {
        time: new Date('2021-05-18T10:00:00.000Z'),
        value: BigNumber.from(300)
    },
    {
        time: new Date('2021-06-18T10:00:00.000Z'),
        value: BigNumber.from(1000)
    }
];

const data2 = [
    {
        time: new Date('2021-04-25T06:30:00.000Z'),
        value: BigNumber.from(50)
    },
    {
        time: new Date('2021-04-25T08:15:00.000Z'),
        value: BigNumber.from(10)
    },
    {
        time: new Date('2021-04-25T08:30:00.000Z'),
        value: BigNumber.from(10)
    }
];

const overMidnightData = [
    {
        time: new Date('2021-04-24T15:00:00.000Z'),
        value: BigNumber.from(100)
    },
    {
        time: new Date('2021-04-24T23:30:00.000Z'),
        value: BigNumber.from(100)
    },
    {
        time: new Date('2021-04-25T00:30:00.000Z'),
        value: BigNumber.from(100)
    }
];
