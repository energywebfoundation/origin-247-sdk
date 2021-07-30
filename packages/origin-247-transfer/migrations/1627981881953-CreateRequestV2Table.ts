import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRequestV2Table1627981881953 implements MigrationInterface {
    name = 'CreateRequestV2Table1627981881953';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "energy_transfer_request_v2" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "transferDate" TIMESTAMP WITH TIME ZONE NOT NULL, "sellerAddress" text NOT NULL, "buyerAddress" text NOT NULL, "volume" text NOT NULL, "certificateId" integer, "validationStatusRecord" text NOT NULL, "processError" text, "state" text, "certificateData" text NOT NULL, CONSTRAINT "UQ_0b4b30035705fd73e6750a9e358" UNIQUE ("certificateId"), CONSTRAINT "PK_b91829c190734bcb15a23986307" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "energy_transfer_request_v2"`);
    }
}
