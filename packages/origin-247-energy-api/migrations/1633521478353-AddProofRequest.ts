import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProofRequest1633521478353 implements MigrationInterface {
    name = 'AddProofRequest1633521478353';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "notary_proof_request" ("id" SERIAL NOT NULL, "deviceId" character varying NOT NULL, "reading" text NOT NULL, "state" character varying NOT NULL, "processError" text, CONSTRAINT "PK_a5421724a3e5b14b11df459d8a5" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "proof_request"`);
    }
}
