import { BigNumber } from '@ethersproject/bignumber';

export const bigNumSumBy = <T extends Record<string, any>, P extends keyof T>(
    values: T[],
    prop: P
) => values.reduce((sum, value) => sum.add(BigNumber.from(value[prop])), BigNumber.from(0));
