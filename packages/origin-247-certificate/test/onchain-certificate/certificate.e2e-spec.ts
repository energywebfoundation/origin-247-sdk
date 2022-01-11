import { bootstrapTestInstance, user2Wallet, userWallet } from '../setup';
import { INestApplication } from '@nestjs/common';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { OnChainCertificateService } from '../../src';

jest.setTimeout(60 * 1000);
process.env.CERTIFICATE_QUEUE_DELAY = '1000';

describe('Certificate service', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let certificateService: OnChainCertificateService;

    beforeAll(async () => {
        ({ app, databaseService, certificateService } = await bootstrapTestInstance());

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('first test - returns no certificates', async () => {
        const result = await certificateService.getAll();

        expect(result).toEqual([]);
    });

    it('allows to issue certificate', async () => {
        const result = await certificateService.issue({
            deviceId: 'd1',
            energyValue: '100',
            fromTime: new Date(),
            toTime: new Date(),
            metadata: null,
            toAddress: userWallet.address,
            userId: userWallet.address
        });

        expect(result).toEqual(
            expect.objectContaining({
                deviceId: 'd1',
                owners: expect.objectContaining({ [userWallet.address]: '100' })
            })
        );
    });

    it('allows to claim certificate', async () => {
        const certificate = await certificateService.issue({
            deviceId: 'd1',
            energyValue: '100',
            fromTime: new Date(),
            toTime: new Date(),
            metadata: null,
            toAddress: userWallet.address,
            userId: userWallet.address
        });

        await certificateService.claim({
            certificateId: certificate.id,
            claimData: {
                beneficiary: '',
                countryCode: '',
                location: '',
                periodEndDate: '',
                periodStartDate: '',
                purpose: ''
            },
            forAddress: userWallet.address,
            energyValue: '50'
        });

        const claimedCertificate = await certificateService.getById(certificate.id);

        expect(claimedCertificate?.owners).toEqual({
            [userWallet.address]: '50'
        });

        expect(claimedCertificate?.claimers).toEqual({
            [userWallet.address]: '50'
        });
    });

    it('allows to transfer certificate', async () => {
        const certificate = await certificateService.issue({
            deviceId: 'd1',
            energyValue: '100',
            fromTime: new Date(),
            toTime: new Date(),
            metadata: null,
            toAddress: userWallet.address,
            userId: userWallet.address
        });

        await certificateService.transfer({
            certificateId: certificate.id,
            fromAddress: userWallet.address,
            toAddress: user2Wallet.address,
            energyValue: '50'
        });

        const transferedCertificate = await certificateService.getById(certificate.id);

        expect(transferedCertificate?.owners).toEqual({
            [userWallet.address]: '50',
            [user2Wallet.address]: '50'
        });
    });

    it('allows to batch issue, batch transfer, and batch claim certificate', async () => {
        const [certificateId] = await certificateService.batchIssue([
            {
                deviceId: 'd1',
                energyValue: '100',
                fromTime: new Date(),
                toTime: new Date(),
                metadata: null,
                toAddress: userWallet.address,
                userId: userWallet.address
            }
        ]);

        await certificateService.batchTransfer([
            {
                certificateId,
                fromAddress: userWallet.address,
                toAddress: user2Wallet.address,
                energyValue: '50'
            }
        ]);

        await certificateService.batchClaim([
            {
                certificateId,
                claimData: {
                    beneficiary: '',
                    countryCode: '',
                    location: '',
                    periodEndDate: '',
                    periodStartDate: '',
                    purpose: ''
                },
                forAddress: user2Wallet.address,
                energyValue: '50'
            }
        ]);

        const certificate = await certificateService.getById(certificateId);

        expect(certificate?.owners).toEqual({
            [userWallet.address]: '50',
            [user2Wallet.address]: '0'
        });
        expect(certificate?.claimers).toEqual({
            [user2Wallet.address]: '50'
        });
    });

    it('Properly parses metadata', async () => {
        const certificateService2 = (certificateService as any) as OnChainCertificateService<{
            custom: string;
        }>;

        const certificate = await certificateService2.issue({
            deviceId: 'd1',
            energyValue: '100',
            fromTime: new Date(),
            toTime: new Date(),
            metadata: { custom: 'data' },
            toAddress: userWallet.address,
            userId: userWallet.address
        });

        expect(certificate.metadata).toEqual({ custom: 'data' });
    });

    it('Properly processes empty batches', async () => {
        expect(await certificateService.batchIssue([])).toEqual([]);
        expect(() => certificateService.batchClaim([])).not.toThrow();
        expect(() => certificateService.batchTransfer([])).not.toThrow();
    });
});
