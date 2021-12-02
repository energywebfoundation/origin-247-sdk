import { bootstrapTestInstance } from './setup';
import { INestApplication } from '@nestjs/common';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { OffchainCertificateService } from '../src';
import { CertificateEventRepository } from '../src/offchain-certificate/repositories/CertificateEvent/CertificateEvent.repository';
import { CertificateCommandRepository } from '../src/offchain-certificate/repositories/CertificateCommand/CertificateCommand.repository';
import { CertificateReadModelRepository } from '../src/offchain-certificate/repositories/CertificateReadModel/CertificateReadModel.repository';

jest.setTimeout(60 * 1000);
process.env.CERTIFICATE_QUEUE_DELAY = '1000';

describe('Offchain Certificate service', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let offchainCertificateService: OffchainCertificateService;
    let certificateEventRepository: CertificateEventRepository;
    let certificateCommandRepository: CertificateCommandRepository;
    let certificateReadModelRepository: CertificateReadModelRepository;

    beforeAll(async () => {
        ({
            app,
            databaseService,
            offchainCertificateService,
            certificateEventRepository,
            certificateCommandRepository,
            certificateReadModelRepository
        } = await bootstrapTestInstance());

        await app.init();
        await databaseService.cleanUp();
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await databaseService.cleanUp();
    });

    describe('Issue', () => {
        it('should issue a certificate', async () => {
            const issueParams = {
                toAddress: '0x1',
                userId: 'someUser',
                energyValue: '100',
                fromTime: new Date('2021-11-22T08:00:00.000Z'),
                toTime: new Date('2021-11-22T08:15:00.000Z'),
                deviceId: 'someDevice',
                metadata: null
            };

            let commands = await certificateCommandRepository.getAll();
            let events = await certificateEventRepository.getAll();
            let readModels = await certificateReadModelRepository.getAll();
            expect(commands).toHaveLength(0);
            expect(events).toHaveLength(0);
            expect(readModels).toHaveLength(0);

            await offchainCertificateService.issue(issueParams);

            commands = await certificateCommandRepository.getAll();
            events = await certificateEventRepository.getAll();
            readModels = await certificateReadModelRepository.getAll();
            expect(commands).toHaveLength(1);
            expect(events).toHaveLength(1);
            expect(readModels).toHaveLength(1);
        });
    });

    describe('Transfer', () => {
        it('should transfer a certificate', async () => {
            const issueParams = {
                toAddress: '0x1',
                userId: 'someUser',
                energyValue: '100',
                fromTime: new Date('2021-11-22T08:00:00.000Z'),
                toTime: new Date('2021-11-22T08:15:00.000Z'),
                deviceId: 'someDevice',
                metadata: null
            };
            await offchainCertificateService.issue(issueParams);

            let commands = await certificateCommandRepository.getAll();
            let events = await certificateEventRepository.getAll();
            let readModels = await certificateReadModelRepository.getAll();
            expect(commands).toHaveLength(1);
            expect(events).toHaveLength(1);
            expect(readModels).toHaveLength(1);

            const internalCertId = events[0].internalCertificateId;
            const transferCommand = {
                certificateId: internalCertId,
                fromAddress: '0x1',
                toAddress: '0x2',
                energyValue: '50'
            };
            await offchainCertificateService.transfer(transferCommand);

            commands = await certificateCommandRepository.getAll();
            events = await certificateEventRepository.getAll();
            readModels = await certificateReadModelRepository.getAll();

            expect(events).toHaveLength(2);
            expect(commands).toHaveLength(2);
            expect(readModels).toHaveLength(1);
            expect(readModels[0].owners).toMatchObject({
                '0x1': '50',
                '0x2': '50'
            });
        });
    });

    describe('Claim', () => {
        it('should claim a certificate', async () => {
            const issueParams = {
                toAddress: '0x1',
                userId: 'someUser',
                energyValue: '100',
                fromTime: new Date('2021-11-22T08:00:00.000Z'),
                toTime: new Date('2021-11-22T08:15:00.000Z'),
                deviceId: 'someDevice',
                metadata: null
            };

            await offchainCertificateService.issue(issueParams);
            let commands = await certificateCommandRepository.getAll();
            let events = await certificateEventRepository.getAll();
            let readModels = await certificateReadModelRepository.getAll();
            expect(commands).toHaveLength(1);
            expect(events).toHaveLength(1);
            expect(readModels).toHaveLength(1);

            const internalCertId = events[0].internalCertificateId;

            const claimCommand = {
                certificateId: internalCertId,
                claimData: {
                    beneficiary: 'someBeneficiary',
                    location: 'Radom',
                    countryCode: 'PL',
                    periodStartDate: '2021-11-18T08:00:00.000Z',
                    periodEndDate: '2021-11-18T08:30:00.000Z',
                    purpose: 'higher'
                },
                forAddress: '0x1',
                energyValue: '100'
            };
            await offchainCertificateService.claim(claimCommand);

            commands = await certificateCommandRepository.getAll();
            events = await certificateEventRepository.getAll();
            readModels = await certificateReadModelRepository.getAll();

            expect(events).toHaveLength(2);
            expect(commands).toHaveLength(2);
            expect(readModels).toHaveLength(1);
            expect(readModels[0].owners).toMatchObject({
                '0x1': '0'
            });
            expect(readModels[0].claimers).toMatchObject({
                '0x1': '100'
            });
        });
    });

    describe('Batch Issue', () => {
        it('should issue multiple certificates', async () => {
            const firstIssueParams = {
                toAddress: '0x1',
                userId: 'someUser',
                energyValue: '100',
                fromTime: new Date('2021-11-22T08:00:00.000Z'),
                toTime: new Date('2021-11-22T08:15:00.000Z'),
                deviceId: 'someDevice',
                metadata: null
            };
            const secondIssueParams = {
                toAddress: '0x2',
                userId: 'someOtherUser',
                energyValue: '100',
                fromTime: new Date('2021-11-22T08:00:00.000Z'),
                toTime: new Date('2021-11-22T08:15:00.000Z'),
                deviceId: 'someOtherDevice',
                metadata: null
            };

            let commands = await certificateCommandRepository.getAll();
            let events = await certificateEventRepository.getAll();
            let readModels = await certificateReadModelRepository.getAll();
            expect(commands).toHaveLength(0);
            expect(events).toHaveLength(0);
            expect(readModels).toHaveLength(0);

            await offchainCertificateService.batchIssue([firstIssueParams, secondIssueParams]);

            commands = await certificateCommandRepository.getAll();
            events = await certificateEventRepository.getAll();
            readModels = await certificateReadModelRepository.getAll();
            expect(commands).toHaveLength(2);
            expect(events).toHaveLength(2);
            expect(readModels).toHaveLength(2);
        });
    });

    describe('BatchTransfer', () => {
        it('should transfer multiple certificates', async () => {
            const issueParams = {
                toAddress: '0x1',
                userId: 'someUser',
                energyValue: '100',
                fromTime: new Date('2021-11-22T08:00:00.000Z'),
                toTime: new Date('2021-11-22T08:15:00.000Z'),
                deviceId: 'someDevice',
                metadata: null
            };

            await offchainCertificateService.issue(issueParams);
            let events = await certificateEventRepository.getAll();

            const internalCertId = events[0].internalCertificateId;
            const firstTransferCommand = {
                certificateId: internalCertId,
                fromAddress: '0x1',
                toAddress: '0x2',
                energyValue: '50'
            };
            const secondTransferCommand = {
                certificateId: internalCertId,
                fromAddress: '0x1',
                toAddress: '0x2',
                energyValue: '50'
            };
            await offchainCertificateService.batchTransfer([
                firstTransferCommand,
                secondTransferCommand
            ]);

            events = await certificateEventRepository.getAll();
            let commands = await certificateCommandRepository.getAll();
            let readModels = await certificateReadModelRepository.getAll();
            expect(commands).toHaveLength(3);
            expect(events).toHaveLength(3);
            expect(readModels).toHaveLength(1);
            expect(readModels[0].owners).toMatchObject({ '0x1': '0', '0x2': '100' });
        });
    });

    describe('BatchClaim', () => {
        it('should claim multiple certificates', async () => {
            const issueParams = {
                toAddress: '0x1',
                userId: 'someUser',
                energyValue: '100',
                fromTime: new Date('2021-11-22T08:00:00.000Z'),
                toTime: new Date('2021-11-22T08:15:00.000Z'),
                deviceId: 'someDevice',
                metadata: null
            };

            await offchainCertificateService.issue(issueParams);
            let events = await certificateEventRepository.getAll();

            const internalCertId = events[0].internalCertificateId;
            const firstClaimCommand = {
                certificateId: internalCertId,
                claimData: {
                    beneficiary: 'someBeneficiary',
                    location: 'Radom',
                    countryCode: 'PL',
                    periodStartDate: '2021-11-18T08:00:00.000Z',
                    periodEndDate: '2021-11-18T08:30:00.000Z',
                    purpose: 'higher'
                },
                forAddress: '0x1',
                energyValue: '50'
            };
            const secondClaimCommand = {
                certificateId: internalCertId,
                claimData: {
                    beneficiary: 'someBeneficiary',
                    location: 'Radom',
                    countryCode: 'PL',
                    periodStartDate: '2021-11-18T08:00:00.000Z',
                    periodEndDate: '2021-11-18T08:30:00.000Z',
                    purpose: 'higher'
                },
                forAddress: '0x1',
                energyValue: '20'
            };
            await offchainCertificateService.claim(firstClaimCommand);
            await offchainCertificateService.claim(secondClaimCommand);

            const readModels = await certificateReadModelRepository.getAll();
            expect(readModels).toHaveLength(1);
            expect(readModels[0].owners).toMatchObject({
                '0x1': '30'
            });
            expect(readModels[0].claimers).toMatchObject({
                '0x1': '70'
            });
        });
    });
});
