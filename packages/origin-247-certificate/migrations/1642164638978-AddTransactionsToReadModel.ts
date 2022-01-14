import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionsToReadModel1642164638978 implements MigrationInterface {
    name = 'AddTransactionsToReadModel1642164638978';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "certificate_read_model" ADD "transactions" text NOT NULL DEFAULT '[]'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "certificate_read_model" DROP COLUMN "transactions"`);
    }
}
