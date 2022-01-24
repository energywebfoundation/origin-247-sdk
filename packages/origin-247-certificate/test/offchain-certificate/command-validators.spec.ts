import {
    claimBatchCommandValidator,
    claimCommandValidator,
    issueBatchCommandValidator,
    issueCommandValidator,
    transferBatchCommandValidator,
    transferCommandValidator
} from '../../src/offchain-certificate/validators';
import { ValidationError } from 'joi';
import { IClaimCommand, IIssueCommand, ITransferCommand } from '../../src';

const fakeAddress = '0xc1912fee45d61c87cc5ea59dae31190fffff232d';

describe('Command validators', () => {
    describe('IssueCommandValidator', () => {
        it('should throw on invalid issue command', async () => {
            const invalidCommand: IIssueCommand<any> = {
                deviceId: '',
                metadata: null,
                energyValue: '-1',
                fromTime: -1,
                toTime: -1,
                userId: '',
                toAddress: 'some-address'
            };

            await expect(issueCommandValidator(invalidCommand)).rejects.toThrow(ValidationError);
        });

        it('should accept valid issue command', async () => {
            const validCommand: IIssueCommand<any> = {
                deviceId: 'deviceId',
                metadata: null,
                energyValue: '0',
                fromTime: 1,
                toTime: 1,
                userId: 'userId',
                toAddress: fakeAddress
            };

            await expect(issueCommandValidator(validCommand)).resolves.toBeDefined();
        });
        it('should accept valid batch issue command', async () => {
            const validCommand: IIssueCommand<any> = {
                deviceId: 'deviceId',
                metadata: null,
                energyValue: '0',
                fromTime: 1,
                toTime: 1,
                userId: 'userId',
                toAddress: fakeAddress
            };

            await expect(issueBatchCommandValidator([validCommand])).resolves.toBeDefined();
        });
    });

    describe('claimCommandValidator', () => {
        it('should throw on invalid claim command', async () => {
            const invalidCommand: IClaimCommand = {
                certificateId: -1,
                energyValue: '-1',
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

            await expect(claimCommandValidator(invalidCommand)).rejects.toThrow();
        });

        it('should accept valid claim command', async () => {
            const validCommand: IClaimCommand = {
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

            await expect(claimCommandValidator(validCommand)).resolves.toBeDefined();
        });
        it('should accept valid batch claim command', async () => {
            const validCommand: IClaimCommand = {
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

            await expect(claimBatchCommandValidator([validCommand])).resolves.toBeDefined();
        });
    });

    describe('transferCommandValidator', () => {
        it('should throw on invalid transfer command', async () => {
            const invalidCommand: ITransferCommand = {
                certificateId: -1,
                energyValue: '-1',
                fromAddress: 'some-address',
                toAddress: 'some-address'
            };

            await expect(transferCommandValidator(invalidCommand)).rejects.toThrow();
        });

        it('should accept valid transfer command', async () => {
            const validCommand: ITransferCommand = {
                certificateId: 0,
                energyValue: '0',
                fromAddress: fakeAddress,
                toAddress: fakeAddress
            };

            await expect(transferCommandValidator(validCommand)).resolves.toBeDefined();
        });
        it('should accept valid batch transfer command', async () => {
            const validCommand: ITransferCommand = {
                certificateId: 0,
                energyValue: '0',
                fromAddress: fakeAddress,
                toAddress: fakeAddress
            };

            await expect(transferBatchCommandValidator([validCommand])).resolves.toBeDefined();
        });
    });
});
