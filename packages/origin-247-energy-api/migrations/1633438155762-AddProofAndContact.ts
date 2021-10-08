import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProofAndContact1633438155762 implements MigrationInterface {
    name = 'AddProofAndContact1633438155762';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "notary_contract" ("address" character varying NOT NULL, "networkId" integer NOT NULL, "deployerPrivateKey" character varying NOT NULL, "rpcNode" character varying NOT NULL, CONSTRAINT "PK_6c3ff62ccd159133885977d0f98" PRIMARY KEY ("address"))`
        );
        await queryRunner.query(
            `CREATE TABLE "notary_proof" ("deviceId" character varying NOT NULL, "readings" text NOT NULL, "rootHash" character varying NOT NULL, "leafs" text NOT NULL, "salts" text NOT NULL, CONSTRAINT "PK_a8046ace5580d44d71207e3e985" PRIMARY KEY ("rootHash"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notary_proof"`);
        await queryRunner.query(`DROP TABLE "notary_contract"`);
    }
}
