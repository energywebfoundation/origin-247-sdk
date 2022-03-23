import { Configuration } from './config.interface';
import { memoize } from 'lodash';
import { validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';

export const getConfiguration = memoize(
    (): Configuration => ({
        DATABASE_URL: process.env.DATABASE_URL,
        DB_HOST: process.env.DB_HOST ?? 'localhost',
        DB_PORT: Number(process.env.DB_PORT ?? 5432),
        DB_USERNAME: process.env.DB_USERNAME ?? 'postgres',
        DB_PASSWORD: process.env.DB_PASSWORD ?? 'postgres',
        DB_DATABASE: process.env.DB_DATABASE ?? 'origin',
        REDIS_URL: process.env.REDIS_URL ?? { host: 'localhost', port: 6379 },
        CERTIFICATE_QUEUE_DELAY: process.env.CERTIFICATE_QUEUE_DELAY
            ? parseInt(process.env.CERTIFICATE_QUEUE_DELAY, 10)
            : 10000,
        ISSUER_PRIVATE_KEY: process.env.ISSUER_PRIVATE_KEY!,
        WEB3: {
            primaryRPC: process.env.WEB3?.split(';')?.[0]!,
            fallbackRPC: process.env.WEB3?.split(';')?.[1]!
        },
        BLOCKCHAIN_POLLING_INTERVAL: process.env.BLOCKCHAIN_POLLING_INTERVAL
            ? parseInt(process.env.BLOCKCHAIN_POLLING_INTERVAL, 10)
            : undefined,
        CERTIFICATE_QUEUE_LOCK_DURATION: Number(
            process.env.CERTIFICATE_QUEUE_LOCK_DURATION ?? 240 * 1000
        ),
        MAX_SYNCHRONIZATION_ATTEMPTS_FOR_EVENT: process.env.MAX_SYNCHRONIZATION_ATTEMPTS_FOR_EVENT
            ? Number(process.env.MAX_SYNCHRONIZATION_ATTEMPTS_FOR_EVENT)
            : 3,
        ISSUE_BATCH_SIZE: process.env.ISSUE_BATCH_SIZE
            ? parseInt(process.env.ISSUE_BATCH_SIZE)
            : 10,
        CLAIM_BATCH_SIZE: process.env.CLAIM_BATCH_SIZE
            ? parseInt(process.env.CLAIM_BATCH_SIZE)
            : 20,
        TRANSFER_BATCH_SIZE: process.env.TRANSFER_BATCH_SIZE
            ? parseInt(process.env.TRANSFER_BATCH_SIZE)
            : 20
    })
);

export const validateConfiguration = async () => {
    const configValues = getConfiguration();
    await validateOrReject(plainToClass(Configuration, configValues));
};
