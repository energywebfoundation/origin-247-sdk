export const CERTIFICATE_247_NAMESPACE = 'origin-247-certificate-config';

export interface Configuration {
    DATABASE_URL?: string;
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    REDIS_URL: string | { host: string; port: number };
    CERTIFICATE_QUEUE_DELAY: number;
    CERTIFICATE_QUEUE_LOCK_DURATION: number;
    MAX_SYNCHRONIZATION_ATTEMPTS_FOR_EVENT: number;
    ISSUE_BATCH_SIZE: number;
    TRANSFER_BATCH_SIZE: number;
    CLAIM_BATCH_SIZE: number;
}
