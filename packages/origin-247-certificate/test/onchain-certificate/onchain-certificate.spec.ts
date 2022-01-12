import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
    IIssueCommandParams,
    OffChainCertificateForUnitTestsModule,
    OffChainCertificateService,
    BlockchainSynchronizeService,
    OnChainCertificateService,
    ONCHAIN_CERTIFICATE_SERVICE_TOKEN,
    OnChainCertificateForUnitTestsModule
} from '../../src';
import { CertificateEventType } from '../../src/offchain-certificate/events/Certificate.events';
import { CertificateEventRepository } from '../../src/offchain-certificate/repositories/CertificateEvent/CertificateEvent.repository';
import { CERTIFICATE_EVENT_REPOSITORY } from '../../src/offchain-certificate/repositories/repository.keys';

describe('OnchainCertificateService', () => {
    let app: TestingModule;
    let onChainCertificateService: OnChainCertificateService;

    describe('Working OnChain module', () => {
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

        it('should issue, transfer, and claim a certificate, and then synchronize it', async () => {
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
