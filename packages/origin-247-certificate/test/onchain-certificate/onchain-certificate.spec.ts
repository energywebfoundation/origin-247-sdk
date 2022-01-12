import { Test, TestingModule } from '@nestjs/testing';
import {
    IIssueCommandParams,
    ONCHAIN_CERTIFICATE_SERVICE_TOKEN,
    OnChainCertificateForUnitTestsModule,
    OnChainCertificateService
} from '../../src';

describe('OnchainCertificateService', () => {
    let app: TestingModule;
    let onChainCertificateService: OnChainCertificateService;

    beforeEach(async () => {
        app = await Test.createTestingModule({
            imports: [OnChainCertificateForUnitTestsModule]
        }).compile();

        onChainCertificateService = await app.resolve(ONCHAIN_CERTIFICATE_SERVICE_TOKEN);

        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('should issue and claim a certificate and have valid volumes in claimers and owners', async () => {
        const certificate = await onChainCertificateService.issue(issueCommand);

        await onChainCertificateService.claim({
            certificateId: certificate.id,
            ...claimCommand
        });

        const claimedCertificate = await onChainCertificateService.getById(certificate.id);

        expect(claimedCertificate?.claimers).toEqual({ [issueCommand.toAddress]: '1000' });
        expect(claimedCertificate?.owners).toEqual({ [issueCommand.toAddress]: '0' });
    });
});

const issueCommand: IIssueCommandParams<null> = {
    deviceId: 'deviceId',
    energyValue: '1000',
    fromTime: new Date('2020-01-01T01:00:00.000Z'),
    toTime: new Date('2020-01-01T01:15:00.000Z'),
    metadata: null,
    toAddress: 'issueAddress',
    userId: 'userId'
};

const claimCommand = {
    forAddress: issueCommand.toAddress,
    claimData: {
        beneficiary: 'beneficiary',
        location: 'location',
        countryCode: 'countryCode',
        periodStartDate: 'periodStartDate',
        periodEndDate: 'periodEndDate',
        purpose: 'purpose'
    }
};

type PublicPart<T> = { [K in keyof T]: T[K] };
