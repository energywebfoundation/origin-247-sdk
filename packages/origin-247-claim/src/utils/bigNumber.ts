import { BigNumber } from '@ethersproject/bignumber';

export const bigNumSum = (values: BigNumber[]) =>
    values.reduce((sum, value) => sum.add(BigNumber.from(value)), BigNumber.from(0));

export const bigNumSumBy = <T extends Record<string, any>, P extends keyof T>(
    values: T[],
    prop: P
) => values.reduce((sum, value) => sum.add(BigNumber.from(value[prop])), BigNumber.from(0));

export const bigNumAvg = (values: BigNumber[]) =>
    values.length > 0 ? bigNumSum(values).div(BigNumber.from(values.length)) : BigNumber.from(0);

export const bigNumMin = (...values: BigNumber[]) =>
    values.reduce((min, value) => {
        return value.lt(min) ? value : min;
    }, values[0]);

export const bigNumPercentage = (part: BigNumber, total: BigNumber) => {
    if (total.eq(0)) {
        return 0;
    }
    return part.mul(1000).div(total).toNumber() / 10;
};
