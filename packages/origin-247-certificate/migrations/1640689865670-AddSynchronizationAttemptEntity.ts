import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSynchronizationAttemptEntity1640689865670 implements MigrationInterface {
    name = 'AddSynchronizationAttemptEntity1640689865670';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "certificate_synchronization_attempt" ("eventId" integer NOT NULL, "attempts_count" integer NOT NULL, "error" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ae7fd0ecf0ff0fa4aca3004f27c" PRIMARY KEY ("eventId"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "certificate_synchronization_attempt"`);
    }
}
