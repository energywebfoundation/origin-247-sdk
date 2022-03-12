import { IClaimCommand } from '../../types';
import {
    IsEthereumAddress,
    IsNumber,
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

export function IsClaimData(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isClaimData',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    const isPlainObject = (value: any) =>
                        typeof value === 'object' && value !== null;
                    const validate = (value: any): boolean => {
                        if (Array.isArray(value)) {
                            return value.every(validate);
                        }

                        if (isPlainObject(value)) {
                            return Object.values(value).every(validate);
                        }

                        return (
                            typeof value === 'string' || typeof value === 'number' || value === null
                        );
                    };

                    if (isPlainObject(value)) {
                        return validate(value);
                    } else {
                        return false;
                    }
                }
            }
        });
    };
}

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
