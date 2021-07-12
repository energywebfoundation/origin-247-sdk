import { bootstrapTestInstance, user2Wallet, userWallet } from './setup';
import { INestApplication } from '@nestjs/common';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { CertificateService } from '../src';

jest.setTimeout(60 * 1000);
process.env.CERTIFICATE_QUEUE_DELAY = '1000';

const transactionTime = () => new Promise((resolve) => setTimeout(resolve, 10000));

describe('Certificate service', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let certificateService: CertificateService;

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

        await transactionTime();

        expect(result).toEqual(
            expect.objectContaining({
                deviceId: 'd1',
                energy: expect.objectContaining({ publicVolume: '100' })
            })
        );

        const cert = await certificateService.getById(result.id);

        expect(cert?.owners).toEqual({
            [userWallet.address]: '100'
        });
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

        await transactionTime();

        const result = await certificateService.claim({
            certificateId: certificate.id,
            claimData: {},
            forAddress: userWallet.address,
            energyValue: '50'
        });

        await transactionTime();

        expect(result).toEqual(
            expect.objectContaining({
                success: true
            })
        );

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

        await transactionTime();

        const result = await certificateService.transfer({
            certificateId: certificate.id,
            fromAddress: userWallet.address,
            toAddress: user2Wallet.address,
            energyValue: '50'
        });

        await transactionTime();

        expect(result).toEqual(
            expect.objectContaining({
                success: true
            })
        );

        const transferedCertificate = await certificateService.getById(certificate.id);

        expect(transferedCertificate?.owners).toEqual({
            [userWallet.address]: '50',
            [user2Wallet.address]: '50'
        });
    });

    it('Properly parses metadata', async () => {
        const certificateService2 = (certificateService as any) as CertificateService<{
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

        await transactionTime();

        const issuedCertificate = await certificateService.getById(certificate.id);

        expect(issuedCertificate?.metadata).toEqual({ custom: 'data' });
    });
});
