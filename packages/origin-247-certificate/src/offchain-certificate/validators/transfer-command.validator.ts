import { ITransferCommand } from '../../types';
import {
    IsEthereumAddress,
    IsNumber,
    IsOptional,
    Min,
    validate,
    validateOrReject
} from 'class-validator';
import { plainToClass } from 'class-transformer';
import { validatorOptions } from './validator.config';
import { IsEnergyValue } from './decorators/is-energy-value';

export const validateTransferCommand = async (command: ITransferCommand) =>
    await validateOrReject(plainToClass(TransferCommandDto, command), validatorOptions);

export const validateBatchTransferCommands = async (commands: ITransferCommand[]) => {
    const validationErrors = await Promise.all(
        commands.map((command) => validate(plainToClass(TransferCommandDto, command)))
    );

    if (validationErrors.every((errors) => errors.length === 0)) {
        return;
    }

    throw validationErrors;
};

class TransferCommandDto implements ITransferCommand {
    @IsNumber()
    @Min(0)
    certificateId: number;
    off;

    @IsEthereumAddress()
    fromAddress: string;

    @IsEthereumAddress()
    toAddress: string;

    @IsOptional()
    @IsEnergyValue()
    energyValue: string;
}
