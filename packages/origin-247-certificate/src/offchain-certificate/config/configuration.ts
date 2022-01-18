import { Configuration } from './config.interface';

const configuration = (): Configuration => ({
    DATABASE_URL: process.env.DATABASE_URL,
    DB_HOST: process.env.DB_HOST ?? 'localhost',
    DB_PORT: process.env.DB_PORT ?? 5432,
    DB_USERNAME: process.env.DB_USERNAME ?? 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD ?? 'postgres',
    DB_DATABASE: process.env.DB_DATABASE ?? 'origin',
    CERTIFICATE_QUEUE_DELAY: Number(process.env.CERTIFICATE_QUEUE_DELAY) ?? 10000,
    CERTIFICATE_QUEUE_LOCK_DURATION: Number(
        process.env.CERTIFICATE_QUEUE_LOCK_DURATION ?? 240 * 1000
    ),
    REDIS_URL: process.env.REDIS_URL ?? { host: 'localhost', port: 6379 },
    MAX_SYNCHRONIZATION_ATTEMPTS_FOR_EVENT: process.env.MAX_SYNCHRONIZATION_ATTEMPTS_FOR_EVENT
        ? Number(process.env.MAX_SYNCHRONIZATION_ATTEMPTS_FOR_EVENT)
        : 3
});

export default configuration;
