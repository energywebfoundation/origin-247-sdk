import { bootstrapTestInstance, userWallet, user2Wallet } from '../setup';
import { INestApplication } from '@nestjs/common';
import {
    OffChainCertificateService,
    BlockchainSynchronizeService,
    IIssueCommandParams,
    OnChainCertificateService
} from '../../src';

jest.setTimeout(60 * 1000);
process.env.CERTIFICATE_QUEUE_DELAY = '1000';

describe('OffchainCertificate', () => {
    let app: INestApplication;
    let cleanDB: () => Promise<void>;
    let offchainCertificateService: OffChainCertificateService;
    let blockchainSynchronizeService: BlockchainSynchronizeService;
    let certificateService: OnChainCertificateService;

    beforeAll(async () => {
        ({
            app,
            offchainCertificateService,
            blockchainSynchronizeService,
            certificateService,
            cleanDB
        } = await bootstrapTestInstance());

        await app.init();
        await cleanDB();
    });

    afterAll(async () => {
        await cleanDB();
        await app.close();
    });

    afterEach(async () => {
        await cleanDB();
    });

    it('should issue, transfer, claim and synchronize', async () => {
        const certificateId = await offchainCertificateService.issue(issueCommand);

        await offchainCertificateService.transfer({
            certificateId,
            ...transferCommand
        });

        await offchainCertificateService.claim({
            certificateId,
            ...claimCommand
        });

        await blockchainSynchronizeService.synchronize();

        await new Promise((r) => setTimeout(r, 30000));

        const readModel = await offchainCertificateService.getById(certificateId);

        expect(readModel).not.toBeNull();
        expect(readModel!.blockchainCertificateId).not.toBeNull();

        const certificate = await certificateService.getById(readModel!.blockchainCertificateId!);

        expect(certificate).toEqual(expectedCertificate);
    });
});

const issueCommand: IIssueCommandParams<null> = {
    deviceId: 'deviceId',
    energyValue: '1000',
    fromTime: new Date('2020-01-01T01:00:00.000Z'),
    toTime: new Date('2020-01-01T01:15:00.000Z'),
    metadata: null,
    toAddress: userWallet.address,
    userId: userWallet.address
};

const transferCommand = {
    fromAddress: userWallet.address,
    toAddress: user2Wallet.address
};

const claimCommand = {
    forAddress: transferCommand.toAddress,
    claimData: {
        beneficiary: 'beneficiary',
        location: 'location',
        countryCode: 'countryCode',
        periodStartDate: 'periodStartDate',
        periodEndDate: 'periodEndDate',
        purpose: 'purpose'
    }
};

const expectedCertificate = {
    id: expect.any(Number),
    deviceId: issueCommand.deviceId,
    generationStartTime: Math.floor(issueCommand.fromTime.getTime() / 1000),
    generationEndTime: Math.floor(issueCommand.toTime.getTime() / 1000),
    creationTime: expect.any(Number),
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
    creationTransactionHash: expect.any(String),
    latestCommitment: null,
    owners: {
        [issueCommand.toAddress]: '0',
        [transferCommand.toAddress]: '0'
    },
    claimers: {
        [claimCommand.forAddress]: issueCommand.energyValue
    },
    claims: [
        {
            id: expect.any(Number),
            from: claimCommand.forAddress,
            to: claimCommand.forAddress,
            value: issueCommand.energyValue,
            claimData: claimCommand.claimData
        }
    ],
    issuedPrivately: expect.any(Boolean),
    metadata: null
};