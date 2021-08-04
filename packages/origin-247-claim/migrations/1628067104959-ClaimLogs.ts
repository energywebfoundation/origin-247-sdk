import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClaimLogs1628067104959 implements MigrationInterface {
    name = 'ClaimLogs1628067104959';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "match_excess_generation" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "generatorId" text NOT NULL, "volume" text NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "generatorMetadata" text NOT NULL, CONSTRAINT "PK_d1a0edc3624d6142394cd991e65" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "match_leftover_consumption" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "consumerId" text NOT NULL, "volume" text NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "consumerMetadata" text NOT NULL, CONSTRAINT "PK_116b46490bbb2a43fbd5b57562b" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "match_result" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "consumerId" text NOT NULL, "generatorId" text NOT NULL, "volume" text NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "consumerMetadata" text NOT NULL, "generatorMetadata" text NOT NULL, CONSTRAINT "PK_a4450d3f8956bd21c5c916ff273" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "match_result"`);
        await queryRunner.query(`DROP TABLE "match_leftover_consumption"`);
        await queryRunner.query(`DROP TABLE "match_excess_generation"`);
    }
}
