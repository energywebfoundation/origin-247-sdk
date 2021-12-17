import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlockchainSynchronization1639680622545 implements MigrationInterface {
    name = 'AddBlockchainSynchronization1639680622545';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "certificate_event" ADD "synchronized" boolean NOT NULL DEFAULT false`
        );
        await queryRunner.query(`ALTER TABLE "certificate_event" ADD "synchronizeError" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "certificate_event" DROP COLUMN "synchronizeError"`);
        await queryRunner.query(`ALTER TABLE "certificate_event" DROP COLUMN "synchronized"`);
    }
}
