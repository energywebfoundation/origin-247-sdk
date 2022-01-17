import { bootstrapTestInstance } from '../setup';
import { INestApplication } from '@nestjs/common';
import { CertificateReadModelRepository } from '../../src/offchain-certificate/repositories/CertificateReadModel/CertificateReadModel.repository';

jest.setTimeout(20 * 1000);
process.env.CERTIFICATE_QUEUE_DELAY = '1000';

describe('CertificateReadModelRepository', () => {
    let app: INestApplication;
    let cleanDB: () => Promise<void>;
    let certificateReadModelRepository: CertificateReadModelRepository<unknown>;

    beforeAll(async () => {
        ({ app, cleanDB, certificateReadModelRepository } = await bootstrapTestInstance());

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
            generationStartTime: Math.floor((1637278545811 - 1000) / 1000),
            generationEndTime: Math.floor(1637278545811 / 1000),
            metadata: {},
            owners: {
                '0x1': '100'
            },
            claimers: {},
            isSynced: false,
            transactions: []
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
            generationStartTime: Math.floor((1637278545811 - 1000) / 1000),
            generationEndTime: Math.floor(1637278545811 / 1000),
            metadata: {},
            owners: {
                '0x1': '100'
            },
            claimers: {},
            isSynced: false,
            transactions: []
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
