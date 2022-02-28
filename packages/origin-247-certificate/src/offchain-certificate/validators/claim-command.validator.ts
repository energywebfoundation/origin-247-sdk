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
import { IsClaimData } from '@energyweb/issuer-api';

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

class ClaimCommandDto implements IClaimCommand {
    @IsNumber()
    @Min(0)
    certificateId: number;

    @IsClaimData()
    claimData: IClaimData;

    @IsEthereumAddress()
    forAddress: string;

    @IsOptional()
    @IsEnergyValue()
    energyValue: string;
}
