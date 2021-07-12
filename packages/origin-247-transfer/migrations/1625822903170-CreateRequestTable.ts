import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRequestTable1625822903170 implements MigrationInterface {
    name = 'CreateRequestTable1625822903170';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "energy_transfer_request" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "transferDate" TIMESTAMPTZ NOT NULL, "sellerAddress" text NOT NULL, "buyerAddress" text NOT NULL, "generatorId" text NOT NULL, "volume" text NOT NULL, "certificateId" integer, "isCertificatePersisted" boolean NOT NULL, "validationStatusRecord" text NOT NULL, "computedValidationStatus" text NOT NULL, CONSTRAINT "UQ_602e9438d10dc174eecf028574a" UNIQUE ("certificateId"), CONSTRAINT "PK_50408be100c51c95e99ed02af7a" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "energy_transfer_request"`);
    }
}
