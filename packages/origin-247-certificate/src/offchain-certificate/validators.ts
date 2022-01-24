import { IClaimCommand, IIssueCommand, ITransferCommand } from '../types';
import Joi, { AsyncValidationOptions } from 'joi';
import { BigNumber } from 'ethers';
import { isAddress } from 'ethers/lib/utils';

const addressSchema = Joi.custom((value, helpers) => {
    if (isAddress(value)) {
        return true;
    }
    return helpers.message({ custom: `"${value}" is not valid address` });
});

const energySchema = Joi.custom((value, helpers) => {
    const isNegative = BigNumber.from(value).isNegative();

    if (isNegative) {
        return helpers.message({ custom: `"${value}" is not valid energy volume` });
    }

    return true;
});
const deviceIdSchema = Joi.string().min(1);
const certificateIdSchema = Joi.number().min(0);

const validationOptions: AsyncValidationOptions = { abortEarly: false, allowUnknown: false };

export const issueCommandValidator = <T>(command: IIssueCommand<T>) =>
    issueCommandSchema.validateAsync(command, validationOptions);

export const issueBatchCommandValidator = <T>(command: IIssueCommand<T>[]) =>
    Joi.array().items(issueCommandSchema).validateAsync(command, validationOptions);

const issueCommandSchema = Joi.object({
    toAddress: addressSchema,
    userId: Joi.string(),
    energyValue: energySchema,
    fromTime: Joi.date().timestamp('unix').min(0),
    toTime: Joi.date().timestamp('unix').min(0),
    deviceId: deviceIdSchema,
    metadata: Joi.any()
});

export const claimCommandValidator = <T>(command: IClaimCommand) =>
    claimCommandSchema.validateAsync(command, validationOptions);

export const claimBatchCommandValidator = <T>(command: IClaimCommand[]) =>
    Joi.array().items(claimCommandSchema).validateAsync(command, validationOptions);

const claimCommandSchema = Joi.object({
    certificateId: certificateIdSchema,
    claimData: Joi.object({
        beneficiary: Joi.string(),
        location: Joi.string(),
        countryCode: Joi.string(),
        periodStartDate: Joi.date(),
        periodEndDate: Joi.date(),
        purpose: Joi.string()
    }),
    forAddress: addressSchema,
    energyValue: energySchema.optional()
});

export const transferCommandValidator = <T>(command: ITransferCommand) =>
    transferCommandSchema.validateAsync(command, validationOptions);

export const transferBatchCommandValidator = <T>(command: ITransferCommand[]) =>
    Joi.array().items(transferCommandSchema).validateAsync(command, validationOptions);

const transferCommandSchema = Joi.object({
    certificateId: certificateIdSchema,
    fromAddress: addressSchema,
    toAddress: addressSchema,
    energyValue: energySchema.optional()
});
