export interface Configuration {
    DATABASE_URL?: string;
    DB_HOST: string;
    DB_PORT: string | number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    CERTIFICATE_QUEUE_DELAY: number;
    CERTIFICATE_QUEUE_LOCK_DURATION: number;
    REDIS_URL: string | any;
    MAX_SYNCHRONIZATION_ATTEMPTS_FOR_EVENT: number;
}
