import { IClaimCommand } from '../../types';
import {
    IsEthereumAddress,
    IsNumber,
    IsObject,
    IsOptional,
    Min,
    registerDecorator,
    validate,
    validateOrReject,
    ValidationOptions
} from 'class-validator';
import { plainToClass } from 'class-transformer';
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

class ClaimCommandDto implements IClaimCommand {
    @IsNumber()
    @Min(0)
    certificateId: number;

    claimData: IClaimData;

    @IsEthereumAddress()
    forAddress: string;

    @IsOptional()
    @IsEnergyValue()
    energyValue: string;
}
