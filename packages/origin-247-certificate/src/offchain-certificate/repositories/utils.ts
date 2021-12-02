import { ValueTransformer } from 'typeorm';

export const bigintTransformer: ValueTransformer = {
    to: (value: number) => value.toString(),
    from: (value: string) => parseInt(value)
};
