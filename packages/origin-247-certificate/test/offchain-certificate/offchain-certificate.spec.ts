import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
    BlockchainSynchronizeService,
    IClaimCommand,
    IIssueCommandParams,
    ITransferCommand,
    OffChainCertificateForUnitTestsModule,
    OffChainCertificateService,
    ONCHAIN_CERTIFICATE_SERVICE_TOKEN,
    OnChainCertificateService
} from '../../src';
import { CertificateEventType } from '../../src/offchain-certificate/events/Certificate.events';
import { CertificateEventRepository } from '../../src/offchain-certificate/repositories/CertificateEvent/CertificateEvent.repository';
import {
    CERTIFICATE_COMMAND_REPOSITORY,
    CERTIFICATE_EVENT_REPOSITORY
} from '../../src/offchain-certificate/repositories/repository.keys';
import { CertificateForUnitTestsService } from '../../src/onchain-certificate/onchain-certificateForUnitTests.service';
import { CertificateErrors } from '../../src/offchain-certificate/errors';
import BatchError = CertificateErrors.BatchError;
import { CertificateCommandRepository } from '../../src/offchain-certificate/repositories/CertificateCommand/CertificateCommand.repository';
import { isEqual } from 'lodash';
import { ethers } from 'ethers';

describe('OffchainCertificateService + BlockchainSynchronizeService', () => {
    let app: TestingModule;
    let offChainCertificateService: OffChainCertificateService;
    let synchronizeService: BlockchainSynchronizeService;
    let onChainCertificateService: OnChainCertificateService;
    let certificateEventRepository: CertificateEventRepository;
    let certificateCommandRepository: CertificateCommandRepository;

    describe('Working OnChain module', () => {
        beforeEach(async () => {
            app = await Test.createTestingModule({
                imports: [OffChainCertificateForUnitTestsModule.register()]
            }).compile();

            offChainCertificateService = await app.resolve(OffChainCertificateService);
            synchronizeService = await app.resolve(BlockchainSynchronizeService);
            onChainCertificateService = await app.resolve(ONCHAIN_CERTIFICATE_SERVICE_TOKEN);
            certificateEventRepository = await app.resolve(CERTIFICATE_EVENT_REPOSITORY);
            certificateCommandRepository = await app.resolve(CERTIFICATE_COMMAND_REPOSITORY);

            await app.init();
        });

        afterEach(async () => {
            await app.close();
        });

        it('should issue, transfer, and claim a certificate, and then synchronize it', async () => {
            const certificateId = await offChainCertificateService.issue(issueCommand);

            await offChainCertificateService.transfer({
                certificateId,
                ...transferCommand
            });

            await offChainCertificateService.claim({
                certificateId,
                ...claimCommand
            });

            await synchronizeService.synchronize();

            const readModel = await offChainCertificateService.getById(certificateId);

            expect(readModel).not.toBeNull();
            expect(readModel!.blockchainCertificateId).not.toBeNull();

            const events = await certificateEventRepository.getAll();

            expect(events).toHaveLength(6);
        });

        it('should issue certificate and then save transfer commands even when they are not further accepted by aggregate', async () => {
            const [certificateId] = await offChainCertificateService.batchIssue([issueCommand]);
            const expectedOriginalError = new Error(
                `Transfer for: ${certificateId} failed. Address: ${transferAddress} has not enough balance.`
            );
            const expectedBatchError = new BatchError(expectedOriginalError);
            const invalidTransferCommandPayload = {
                certificateId,
                ...transferCommand,
                fromAddress: transferAddress,
                toAddress: issueAddress
            };

            await expect(() =>
                offChainCertificateService.batchTransfer([invalidTransferCommandPayload])
            ).rejects.toEqual(expectedBatchError);

            const commands = await certificateCommandRepository.getAll();
            const savedTransferCommand = commands.find((c) =>
                isEqual(invalidTransferCommandPayload, c.payload)
            );
            expect(savedTransferCommand).toBeDefined();
        });

        it('should issue certificate and then save claim commands even when they are not further accepted by aggregate', async () => {
            const [certificateId] = await offChainCertificateService.batchIssue([issueCommand]);
            const expectedOriginalError = new Error(
                `Claim for internalCertificateId: ${certificateId} failed. Transfer is for zero address(0x0).`
            );
            const expectedBatchError = new BatchError(expectedOriginalError);
            const invalidClaimCommandPayload = {
                certificateId,
                ...claimCommand,
                forAddress: ethers.constants.AddressZero
            };

            await expect(() =>
                offChainCertificateService.batchClaim([invalidClaimCommandPayload])
            ).rejects.toEqual(expectedBatchError);

            const commands = await certificateCommandRepository.getAll();
            const savedClaimCommand = commands.find((c) =>
                isEqual(invalidClaimCommandPayload, c.payload)
            );
            expect(savedClaimCommand).toBeDefined();
        });

        it('should batch issue, batch transfer, and batch claim certificates, and then synchronize it', async () => {
            const [id1, id2] = await offChainCertificateService.batchIssue([
                issueCommand,
                issueCommand
            ]);

            await offChainCertificateService.batchTransfer([
                { certificateId: id1, ...transferCommand },
                { certificateId: id2, ...transferCommand }
            ]);

            await offChainCertificateService.batchClaim([
                { certificateId: id1, ...claimCommand },
                { certificateId: id2, ...claimCommand }
            ]);

            await synchronizeService.synchronize();

            const [readModel1, readModel2] = await offChainCertificateService.getAll();

            expect(readModel1).not.toBeNull();
            expect(readModel1!.blockchainCertificateId).not.toBeNull();

            expect(readModel2).not.toBeNull();
            expect(readModel2!.blockchainCertificateId).not.toBeNull();

            const events = await certificateEventRepository.getAll();

            expect(events).toHaveLength(6 * 2);
        });

        it('should synchronize even if nothing is present', async () => {
            await expect(synchronizeService.synchronize()).resolves.toBeUndefined();
        });
    });

    describe('Failing OnChain', () => {
        const setup = async (failingOn: 'issue' | 'transfer' | 'claim', call = 1) => {
            app = await Test.createTestingModule({
                imports: [getFailingModuleForUnitTests(failingOn, call)]
            }).compile();

            offChainCertificateService = await app.resolve(OffChainCertificateService);
            synchronizeService = await app.resolve(BlockchainSynchronizeService);
            onChainCertificateService = await app.resolve(ONCHAIN_CERTIFICATE_SERVICE_TOKEN);
            certificateEventRepository = await app.resolve(CERTIFICATE_EVENT_REPOSITORY);

            await app.init();
        };

        afterEach(async () => {
            await app.close();
        });

        it('should fail batch on issue persistance', async () => {
            await setup('issue');

            const [id1, id2] = await offChainCertificateService.batchIssue([
                issueCommand,
                issueCommand
            ]);

            await synchronizeService.synchronize();

            const events = await certificateEventRepository.getAll();

            const issueEvents = events.filter((e) => e.type === CertificateEventType.Issued);
            const errorEvents = events.filter((e) => e.type === CertificateEventType.PersistError);

            expect(issueEvents).toHaveLength(2);
            expect(errorEvents).toHaveLength(2);
        });

        it('should fail on batch transfer persistance', async () => {
            await setup('transfer');

            const [id1, id2] = await offChainCertificateService.batchIssue([
                issueCommand,
                issueCommand
            ]);

            await offChainCertificateService.batchTransfer([
                { certificateId: id1, ...transferCommand },
                { certificateId: id2, ...transferCommand }
            ]);

            await synchronizeService.synchronize();

            const events = await certificateEventRepository.getAll();

            const issueEvents = events.filter((e) => e.type === CertificateEventType.Issued);
            const issuePersistedEvents = events.filter(
                (e) => e.type === CertificateEventType.IssuancePersisted
            );
            const transferEvents = events.filter(
                (e) => e.type === CertificateEventType.Transferred
            );
            const errorEvents = events.filter((e) => e.type === CertificateEventType.PersistError);

            expect(issueEvents).toHaveLength(2);
            expect(issuePersistedEvents).toHaveLength(2);
            expect(transferEvents).toHaveLength(2);
            expect(errorEvents).toHaveLength(2);
        });

        it('should fail on batch claim persistance', async () => {
            await setup('claim');

            const [id1, id2] = await offChainCertificateService.batchIssue([
                issueCommand,
                issueCommand
            ]);

            await offChainCertificateService.batchTransfer([
                { certificateId: id1, ...transferCommand },
                { certificateId: id2, ...transferCommand }
            ]);

            await offChainCertificateService.batchClaim([
                { certificateId: id1, ...claimCommand },
                { certificateId: id2, ...claimCommand }
            ]);

            await synchronizeService.synchronize();

            const events = await certificateEventRepository.getAll();

            const issueEvents = events.filter((e) => e.type === CertificateEventType.Issued);
            const issuePersistedEvents = events.filter(
                (e) => e.type === CertificateEventType.IssuancePersisted
            );
            const transferEvents = events.filter(
                (e) => e.type === CertificateEventType.Transferred
            );
            const transferPersistedEvents = events.filter(
                (e) => e.type === CertificateEventType.TransferPersisted
            );
            const claimEvents = events.filter((e) => e.type === CertificateEventType.Claimed);
            const errorEvents = events.filter((e) => e.type === CertificateEventType.PersistError);

            expect(issueEvents).toHaveLength(2);
            expect(issuePersistedEvents).toHaveLength(2);
            expect(transferEvents).toHaveLength(2);
            expect(transferPersistedEvents).toHaveLength(2);
            expect(claimEvents).toHaveLength(2);
            expect(errorEvents).toHaveLength(2);
        });

        it('should be able to process not failed certificate, and fail another certificiate', async () => {
            await setup('transfer', 2);

            const [id1, id2] = await offChainCertificateService.batchIssue([
                issueCommand,
                issueCommand
            ]);

            await offChainCertificateService.batchTransfer([
                { certificateId: id1, ...transferCommand }
            ]);

            await synchronizeService.synchronize();

            await offChainCertificateService.batchTransfer([
                { certificateId: id2, ...transferCommand }
            ]);

            await offChainCertificateService.batchClaim([
                { certificateId: id1, ...claimCommand },
                { certificateId: id2, ...claimCommand }
            ]);

            await synchronizeService.synchronize();

            const events = await certificateEventRepository.getAll();

            const issueEvents = events.filter((e) => e.type === CertificateEventType.Issued);
            const issuePersistedEvents = events.filter(
                (e) => e.type === CertificateEventType.IssuancePersisted
            );
            const transferEvents = events.filter(
                (e) => e.type === CertificateEventType.Transferred
            );
            const transferPersistedEvents = events.filter(
                (e) => e.type === CertificateEventType.TransferPersisted
            );
            const claimEvents = events.filter((e) => e.type === CertificateEventType.Claimed);
            const claimPersistedEvents = events.filter(
                (e) => e.type === CertificateEventType.ClaimPersisted
            );
            const errorEvents = events.filter((e) => e.type === CertificateEventType.PersistError);

            expect(issueEvents).toHaveLength(2);
            expect(issuePersistedEvents).toHaveLength(2);
            expect(transferEvents).toHaveLength(2);
            expect(transferPersistedEvents).toHaveLength(1);
            expect(claimEvents).toHaveLength(2);
            expect(claimPersistedEvents).toHaveLength(1);
            expect(errorEvents).toHaveLength(1);
        });

        afterEach(async () => {
            await app.close();
        });
    });

    describe('Difference between internal and blockchain certificate id', () => {
        beforeEach(async () => {
            app = await Test.createTestingModule({
                imports: [getNotAlignedIdsModuleForUnitTests()]
            }).compile();

            offChainCertificateService = await app.resolve(OffChainCertificateService);
            synchronizeService = await app.resolve(BlockchainSynchronizeService);
            onChainCertificateService = await app.resolve(ONCHAIN_CERTIFICATE_SERVICE_TOKEN);
            certificateEventRepository = await app.resolve(CERTIFICATE_EVENT_REPOSITORY);

            await app.init();
        });

        afterEach(async () => {
            await app.close();
        });

        it('Correctly transfers and claim not aligned certificate id', async () => {
            const id = await offChainCertificateService.issue(issueCommand);

            await offChainCertificateService.transfer({
                certificateId: id,
                ...transferCommand
            });

            await offChainCertificateService.claim({
                certificateId: id,
                ...claimCommand
            });

            await synchronizeService.synchronize();

            const certificate = await offChainCertificateService.getById(id);
            expect(certificate?.transactions).toHaveLength(3);
        });
    });
});

const issueAddress = '0xc1912fee45d61c87cc5ea59dae31190fffff232d';
const transferAddress = '0x29D7d1dd5B6f9C864d9db560D72a247c178aE86B';

const issueCommand: IIssueCommandParams<null> = {
    deviceId: 'deviceId',
    energyValue: '1000',
    fromTime: new Date('2020-01-01T01:00:00.000Z'),
    toTime: new Date('2020-01-01T01:15:00.000Z'),
    metadata: null,
    toAddress: issueAddress,
    userId: 'userId'
};

const transferCommand = {
    fromAddress: issueAddress,
    toAddress: transferAddress,
    energyValue: '1000'
};

const claimCommand = {
    forAddress: transferCommand.toAddress,
    claimData: {
        beneficiary: 'beneficiary',
        location: 'location',
        countryCode: 'countryCode',
        periodStartDate: new Date().toISOString(),
        periodEndDate: new Date().toISOString(),
        purpose: 'purpose'
    },
    energyValue: '1000'
};

type PublicPart<T> = { [K in keyof T]: T[K] };

const getFailingModuleForUnitTests = (failingOn: 'issue' | 'claim' | 'transfer', call = 1) => {
    let failedCalls = 0;

    @Injectable()
    class CertificateForUnitTestsService<T> implements PublicPart<OnChainCertificateService<T>> {
        private serial: number = 0;

        public async getAll(): Promise<any> {
            throw new Error('Not implemented');
        }

        public async getById(): Promise<any> {
            throw new Error('Not implemented');
        }

        public async issue(command: IIssueCommandParams<any>): Promise<any> {
            if (failingOn === 'issue') {
                failedCalls += 1;

                if (failedCalls >= call) {
                    throw new Error('Failed issuance');
                }
            }

            this.serial += 1;

            return {
                id: this.serial,
                claims: [],
                claimers: {},
                creationBlockHash: '',
                creationTime: Math.floor(Date.now() / 1000),
                deviceId: command.deviceId,
                generationStartTime: Math.floor(command.fromTime.getTime() / 1000),
                generationEndTime: Math.floor(command.toTime.getTime() / 1000),
                issuedPrivately: false,
                metadata: command.metadata,
                owners: {
                    [command.toAddress]: command.energyValue
                },
                isClaimed: false,
                isOwned: true,
                myClaims: [],
                energy: {
                    claimedVolume: '0',
                    privateVolume: '0',
                    publicVolume: command.energyValue
                }
            };
        }

        public async claim(): Promise<void> {
            if (failingOn === 'claim') {
                failedCalls += 1;

                if (failedCalls >= call) {
                    throw new Error('Failed claiming');
                }
            }
        }

        public async transfer(): Promise<void> {
            if (failingOn === 'transfer') {
                failedCalls += 1;

                if (failedCalls >= call) {
                    throw new Error('Failed transfer');
                }
            }
        }

        public async batchIssue(certs: IIssueCommandParams<T>[]): Promise<number[]> {
            if (failingOn === 'issue') {
                failedCalls += 1;

                if (failedCalls >= call) {
                    throw new Error('Failed issuance');
                }
            }

            return [this.serial++, this.serial++];
        }

        public async batchClaim(): Promise<void> {
            await this.claim();
        }

        public async batchTransfer(): Promise<void> {
            await this.transfer();
        }

        public async batchIssueWithTxHash(command: IIssueCommandParams<T>[]) {
            return { certificateIds: await this.batchIssue(command), transactionHash: 'txHash' };
        }

        public async batchTransferWithTxHash() {
            await this.batchTransfer();

            return { transactionHash: 'txHash' };
        }

        public async batchClaimWithTxHash(command: IClaimCommand[]) {
            await this.batchClaim();

            return { transactionHash: 'txHash' };
        }

        public async issueWithTxHash(command: IIssueCommandParams<T>) {
            const certificate = await this.issue(command);

            return {
                certificateId: certificate.id,
                transactionHash: 'txHash'
            };
        }

        public async transferWithTxHash(command: ITransferCommand) {
            await this.transfer();

            return { transactionHash: 'txHash' };
        }

        public async claimWithTxHash(command: IClaimCommand) {
            await this.claim();

            return { transactionHash: 'txHash' };
        }
    }

    @Module({
        providers: [
            {
                provide: ONCHAIN_CERTIFICATE_SERVICE_TOKEN,
                useClass: CertificateForUnitTestsService
            }
        ],
        exports: [ONCHAIN_CERTIFICATE_SERVICE_TOKEN]
    })
    class FailingOnChainModuleForUnitTests {}

    return OffChainCertificateForUnitTestsModule.register(FailingOnChainModuleForUnitTests);
};

const getNotAlignedIdsModuleForUnitTests = () => {
    @Injectable()
    class CertificateNotAlignedTestsService<T> extends CertificateForUnitTestsService<T> {
        protected serial = 100;
    }

    @Module({
        providers: [
            {
                provide: ONCHAIN_CERTIFICATE_SERVICE_TOKEN,
                useClass: CertificateNotAlignedTestsService
            }
        ],
        exports: [ONCHAIN_CERTIFICATE_SERVICE_TOKEN]
    })
    class FailingOnChainModuleForUnitTests {}

    return OffChainCertificateForUnitTestsModule.register(FailingOnChainModuleForUnitTests);
};
