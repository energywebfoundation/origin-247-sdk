import { MigrationInterface, QueryRunner } from 'typeorm';

export const sequenceName = 'certificate_internal_certificate_id_seq';

export class AddInternalCertificateIdSequence1643115428770 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS ${sequenceName}`);

        const [{ count }] = await queryRunner.query(
            `SELECT COUNT(*) FROM certificate_event WHERE type = 'Issued'`
        );

        if (Number(count) === 0) {
            await queryRunner.query(`ALTER SEQUENCE ${sequenceName} RESTART`);
        } else {
            await queryRunner.query(`ALTER SEQUENCE ${sequenceName} RESTART ${Number(count) + 1}`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SEQUENCE ${sequenceName}`);
    }
}
