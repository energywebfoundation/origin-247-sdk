import { IClaimCommand } from '../../types';
import {
    IsDateString,
    IsEthereumAddress,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    validate,
    ValidateNested,
    validateOrReject
} from 'class-validator';
import { plainToClass, Type } from 'class-transformer';
import { IsEnergyValue } from './decorators/is-energy-value';
import { validatorOptions } from './validator.config';
import { IClaimData } from '@energyweb/issuer';

export const validateClaimCommand = async (command: IClaimCommand) =>
    await validateOrReject(plainToClass(ClaimCommandDto, command), validatorOptions);

export const validateBatchClaimCommands = async (commands: IClaimCommand[]) => {
    const validationErrors = await Promise.all(
        commands.map((command) => validate(plainToClass(ClaimCommandDto, command)))
    );

    if (validationErrors.every((errors) => errors.length === 0)) {
        return;
    }

    throw validationErrors;
};

class ClaimDataDto implements IClaimData {
    @IsString()
    beneficiary: string;

    @IsString()
    location: string;

    @IsString()
    countryCode: string;

    @IsDateString()
    periodStartDate: string;

    @IsDateString()
    periodEndDate: string;

    @IsString()
    purpose: string;
}

class ClaimCommandDto implements IClaimCommand {
    @IsNumber()
    @Min(0)
    certificateId: number;

    @ValidateNested()
    @Type(() => ClaimDataDto)
    claimData: ClaimDataDto;

    @IsEthereumAddress()
    forAddress: string;

    @IsOptional()
    @IsEnergyValue()
    energyValue: string;
}
