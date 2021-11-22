import { MigrationInterface, QueryRunner } from 'typeorm';

export class createOffchainCertificateTables1637620434040 implements MigrationInterface {
    name = 'createOffchainCertificateTables1637620434040';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "certificate_command" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "payload" text NOT NULL, CONSTRAINT "PK_dfcb7cba5a9d9ab2f66e2e6cde2" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "certificate_event" ("id" SERIAL NOT NULL, "internalCertificateId" bigint NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "commandId" integer NOT NULL, "type" character varying NOT NULL, "version" integer NOT NULL, "payload" text NOT NULL, CONSTRAINT "PK_d14af3eefff2434de5c32adb058" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_b1613d0d62da5403c6302550f2" ON "certificate_event" ("internalCertificateId") `
        );
        await queryRunner.query(
            `CREATE TABLE "certificate_read_model" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "internalCertificateId" bigint NOT NULL, "blockchainCertificateId" integer, "deviceId" character varying NOT NULL, "generationStartTime" bigint NOT NULL, "generationEndTime" bigint NOT NULL, "creationTime" bigint NOT NULL, "owners" text NOT NULL, "claimers" text NOT NULL, "claims" text NOT NULL, "creationBlockHash" character varying NOT NULL, "metadata" text, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a2b86876249d8011aeb709f4b44" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_213ddb7ca09203210cbe84b027" ON "certificate_read_model" ("internalCertificateId") `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_213ddb7ca09203210cbe84b027"`);
        await queryRunner.query(`DROP TABLE "certificate_read_model"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b1613d0d62da5403c6302550f2"`);
        await queryRunner.query(`DROP TABLE "certificate_event"`);
        await queryRunner.query(`DROP TABLE "certificate_command"`);
    }
}
