import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSynchronizationAttemptEntity1640338662510 implements MigrationInterface {
    name = 'AddSynchronizationAttemptEntity1640338662510';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "certificate_synchronization_attempt" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "internalCertificateId" integer NOT NULL, "type" character varying NOT NULL, "attempts_count" integer NOT NULL, "synchronized" boolean NOT NULL, "has_error" boolean NOT NULL, CONSTRAINT "PK_f132795ed8c5f1db2d428800fd3" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "certificate_synchronization_attempt"`);
    }
}
