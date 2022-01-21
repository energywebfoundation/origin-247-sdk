export interface Configuration {
    DATABASE_URL?: string;
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    CERTIFICATE_QUEUE_DELAY: number;
    CERTIFICATE_QUEUE_LOCK_DURATION: number;
    REDIS_URL: string | { host: string; port: number };
    MAX_SYNCHRONIZATION_ATTEMPTS_FOR_EVENT: number;
}
