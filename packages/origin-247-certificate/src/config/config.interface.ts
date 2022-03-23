import {
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested
} from 'class-validator';

export class Web3Providers {
    @IsString()
    @IsNotEmpty()
    public readonly primaryRPC: string;
    @IsString()
    @IsNotEmpty()
    public readonly fallbackRPC: string;
}

export class Configuration {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    public readonly DATABASE_URL?: string;

    @IsString()
    @IsNotEmpty()
    public readonly DB_HOST: string;

    @IsNumber()
    @Min(0)
    public readonly DB_PORT: number;

    @IsString()
    @IsNotEmpty()
    public readonly DB_USERNAME: string;

    @IsString()
    @IsNotEmpty()
    public readonly DB_PASSWORD: string;

    @IsString()
    @IsNotEmpty()
    public readonly DB_DATABASE: string;

    @IsDefined()
    public readonly REDIS_URL: string | { host: string; port: number };

    @IsNumber()
    @Min(0)
    public readonly CERTIFICATE_QUEUE_DELAY: number;

    @IsNumber()
    @Min(0)
    public readonly CERTIFICATE_QUEUE_LOCK_DURATION: number;

    @IsNumber()
    @Min(0)
    public readonly MAX_SYNCHRONIZATION_ATTEMPTS_FOR_EVENT: number;

    @IsNumber()
    @Min(1)
    public readonly ISSUE_BATCH_SIZE: number;

    @IsNumber()
    @Min(1)
    public readonly TRANSFER_BATCH_SIZE: number;

    @IsNumber()
    @Min(1)
    public readonly CLAIM_BATCH_SIZE: number;

    @IsNumber()
    @Min(1)
    @IsOptional()
    public readonly BLOCKCHAIN_POLLING_INTERVAL?: number;

    @IsString()
    @IsNotEmpty()
    public readonly ISSUER_PRIVATE_KEY: string;

    @ValidateNested()
    public readonly WEB3: Web3Providers;
}
