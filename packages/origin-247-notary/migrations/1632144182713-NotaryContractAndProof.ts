import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotaryContractAndProof1632144182713 implements MigrationInterface {
    name = 'NotaryContractAndProof1632144182713';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "notary_contract" ("address" character varying NOT NULL, "networkId" integer NOT NULL, "deployerPrivateKey" character varying NOT NULL, "rpcNode" character varying NOT NULL, CONSTRAINT "PK_6c3ff62ccd159133885977d0f98" PRIMARY KEY ("address"))`
        );
        await queryRunner.query(
            `CREATE TABLE "notary_proof" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deviceId" character varying NOT NULL, "readings" text NOT NULL, "rootHash" character varying NOT NULL, "leafs" text NOT NULL, "salts" text NOT NULL, CONSTRAINT "PK_9e58d4b7a4ac35702e044df2de7" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notary_proof"`);
        await queryRunner.query(`DROP TABLE "notary_contract"`);
    }
}
