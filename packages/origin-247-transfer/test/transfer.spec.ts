import { Test } from '@nestjs/testing';
import { TransferModuleForUnitTest } from '../src';

describe('Transfer module', () => {
    it('should build', async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [TransferModuleForUnitTest],
            providers: []
        }).compile();

        const app = moduleFixture.createNestApplication();

        expect(true).toBe(true);
    });
});
