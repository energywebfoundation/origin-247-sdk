import { IClaimCommand, IIssueCommand, ITransferCommand } from '../../src';
import {
    validateBatchClaimCommands,
    validateBatchIssueCommands,
    validateBatchTransferCommands,
    validateClaimCommand,
    validateIssueCommand,
    validateTransferCommand
} from '../../src/offchain-certificate/validators';

const fakeAddress = '0xc1912fee45d61c87cc5ea59dae31190fffff232d';

describe('Command validators', () => {
    describe('IssueCommandValidator', () => {
        it('should throw on invalid issue command', async () => {
            await expect(validateIssueCommand(invalidIssueCommand)).rejects.toEqual(
                invalidIssueCommandErrors
            );
        });

        it('should accept valid issue command', async () => {
            await expect(validateIssueCommand(validIssueCommand)).resolves.toBeUndefined();
        });

        it('should accept valid batch issue command', async () => {
            await expect(validateBatchIssueCommands([validIssueCommand])).resolves.toBeUndefined();
        });

        it('should reject invalid batch issue command', async () => {
            await expect(validateBatchIssueCommands([invalidIssueCommand])).rejects.toEqual(
                expect.arrayContaining([invalidIssueCommandErrors])
            );
        });
    });

    describe('claimCommandValidator', () => {
        it('should throw on invalid claim command', async () => {
            await expect(validateClaimCommand(invalidClaimCommand)).rejects.toEqual(
                invalidClaimCommandErrors
            );
        });

        it('should accept valid claim command', async () => {
            await expect(validateClaimCommand(validClaimCommand)).resolves.toBeUndefined();
        });
        it('should accept valid batch claim command', async () => {
            await expect(validateBatchClaimCommands([validClaimCommand])).resolves.toBeUndefined();
        });

        it('should reject invalid batch claim command', async () => {
            await expect(validateBatchClaimCommands([invalidClaimCommand])).rejects.toEqual(
                expect.arrayContaining([invalidClaimCommandErrors])
            );
        });
    });

    describe('transferCommandValidator', () => {
        it('should throw on invalid transfer command', async () => {
            await expect(validateTransferCommand(invalidTransferCommand)).rejects.toEqual(
                invalidTransferCommandErrors
            );
        });

        it('should accept valid transfer command', async () => {
            await expect(validateTransferCommand(validTransferCommand)).resolves.toBeUndefined();
        });

        it('should accept valid batch transfer command', async () => {
            await expect(
                validateBatchTransferCommands([validTransferCommand])
            ).resolves.toBeUndefined();
        });

        it('should reject invalid batch transfer command', async () => {
            await expect(validateBatchTransferCommands([invalidTransferCommand])).rejects.toEqual(
                expect.arrayContaining([invalidTransferCommandErrors])
            );
        });
    });
});

const invalidIssueCommand: IIssueCommand<any> = {
    deviceId: '',
    metadata: null,
    energyValue: '-1',
    fromTime: -1,
    toTime: -1,
    userId: '',
    toAddress: 'some-address'
};

const invalidClaimCommand: IClaimCommand = {
    certificateId: -1,
    energyValue: 'asd',
    claimData: {
        beneficiary: '',
        countryCode: '',
        location: '',
        periodEndDate: '',
        periodStartDate: '',
        purpose: ''
    },
    forAddress: 'some-address'
};

const invalidTransferCommand: ITransferCommand = {
    certificateId: -1,
    energyValue: '-1',
    fromAddress: 'some-address',
    toAddress: 'some-address'
};

const validIssueCommand: IIssueCommand<any> = {
    deviceId: 'deviceId',
    metadata: null,
    energyValue: '0',
    fromTime: 1,
    toTime: 1,
    userId: 'userId',
    toAddress: fakeAddress
};

const validClaimCommand: IClaimCommand = {
    certificateId: 0,
    energyValue: '0',
    claimData: {
        beneficiary: 'stub',
        countryCode: 'stub',
        location: 'stub',
        periodEndDate: new Date().toISOString(),
        periodStartDate: new Date().toISOString(),
        purpose: 'stub'
    },
    forAddress: fakeAddress
};

const validTransferCommand: ITransferCommand = {
    certificateId: 0,
    energyValue: '0',
    fromAddress: fakeAddress,
    toAddress: fakeAddress
};

const expectValidationOf = ({
    value,
    constraint,
    property
}: {
    property: string;
    value: any;
    constraint: string;
}) =>
    expect.objectContaining({
        children: [],
        constraints: { [constraint]: expect.any(String) },
        property,
        value
    });

const invalidIssueCommandErrors = expect.arrayContaining([
    expectValidationOf({
        value: 'some-address',
        constraint: 'isEthereumAddress',
        property: 'toAddress'
    }),
    expectValidationOf({
        constraint: 'isEnergyValue',
        property: 'energyValue',
        value: '-1'
    }),
    expectValidationOf({
        constraint: 'isNotEmpty',
        property: 'userId',
        value: ''
    }),
    expectValidationOf({
        constraint: 'min',
        property: 'fromTime',
        value: -1
    }),
    expectValidationOf({
        constraint: 'min',
        property: 'toTime',
        value: -1
    }),
    expectValidationOf({
        constraint: 'isNotEmpty',
        property: 'deviceId',
        value: ''
    })
]);

const invalidClaimCommandErrors = expect.arrayContaining([
    expectValidationOf({
        value: -1,
        constraint: 'min',
        property: 'certificateId'
    }),
    expectValidationOf({
        constraint: 'isEnergyValue',
        property: 'energyValue',
        value: 'asd'
    }),
    expectValidationOf({
        value: 'some-address',
        constraint: 'isEthereumAddress',
        property: 'forAddress'
    })
]);

const invalidTransferCommandErrors = expect.arrayContaining([
    expectValidationOf({
        value: -1,
        constraint: 'min',
        property: 'certificateId'
    }),
    expectValidationOf({
        constraint: 'isEnergyValue',
        property: 'energyValue',
        value: '-1'
    }),
    expectValidationOf({
        value: 'some-address',
        constraint: 'isEthereumAddress',
        property: 'fromAddress'
    }),
    expectValidationOf({
        value: 'some-address',
        constraint: 'isEthereumAddress',
        property: 'toAddress'
    })
]);
