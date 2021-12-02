import { bootstrapTestInstance } from './setup';
import { INestApplication } from '@nestjs/common';
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { CertificateReadModelRepository } from '../src/offchain-certificate/repositories/CertificateReadModel/CertificateReadModel.repository';
import { CertificateAggregate } from '../src/offchain-certificate/certificate.aggregate';

jest.setTimeout(20 * 1000);
process.env.CERTIFICATE_QUEUE_DELAY = '1000';

describe('CertificateReadModelRepository', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;
    let certificateReadModelRepository: CertificateReadModelRepository;

    beforeAll(async () => {
        ({ app, databaseService, certificateReadModelRepository } = await bootstrapTestInstance());

        await app.init();
        await databaseService.cleanUp();
    });

    afterAll(async () => {
        await databaseService.cleanUp();
        await app.close();
    });

    afterEach(async () => {
        await databaseService.cleanUp();
    });
    it('should return empty array when there are no readModels', async () => {
        const certs = await certificateReadModelRepository.getAll();
        expect(certs).toHaveLength(0);
    });

    it('should save readModel', async () => {
        const certificateReadModel = {
            internalCertificateId: 1,
            blockchainCertificateId: null,
            claims: [],
            creationBlockHash: '',
            creationTime: Math.floor(Date.now() / 1000),
            deviceId: 'someDevice',
            generationStartTime: 1637278545811 - 1000,
            generationEndTime: 1637278545811,
            metadata: {},
            owners: {
                '0x1': '100'
            },
            claimers: {}
        };
        await certificateReadModelRepository.save(certificateReadModel);
        const saved = await certificateReadModelRepository.getByInternalCertificateId(1);

        expect(saved).toMatchObject(certificateReadModel);
    });

    it('should update readModel', async () => {
        const certificateReadModel = {
            internalCertificateId: 1,
            blockchainCertificateId: null,
            claims: [],
            creationBlockHash: '',
            creationTime: Math.floor(Date.now() / 1000),
            deviceId: 'someDevice',
            generationStartTime: 1637278545811 - 1000,
            generationEndTime: 1637278545811,
            metadata: {},
            owners: {
                '0x1': '100'
            },
            claimers: {}
        };
        await certificateReadModelRepository.save(certificateReadModel);
        certificateReadModel.owners = { '0x1': '50' };
        await certificateReadModelRepository.save(certificateReadModel);
        const saved = await certificateReadModelRepository.getByInternalCertificateId(1);
        const certs = await certificateReadModelRepository.getAll();
        expect(certs).toHaveLength(1);
        expect(saved).toMatchObject(certificateReadModel);
    });
});
