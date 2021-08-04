import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClaimLogs1628061005210 implements MigrationInterface {
    name = 'ClaimLogs1628061005210';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "excess_generation" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "generatorId" text NOT NULL, "volume" text NOT NULL, "from" TIMESTAMP WITH TIME ZONE NOT NULL, "to" TIMESTAMP WITH TIME ZONE NOT NULL, "generatorMetadata" text NOT NULL, CONSTRAINT "PK_148501091c857546abf2b5cd7c5" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "leftover_consumption" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "consumerId" text NOT NULL, "volume" text NOT NULL, "from" TIMESTAMP WITH TIME ZONE NOT NULL, "to" TIMESTAMP WITH TIME ZONE NOT NULL, "consumerMetadata" text NOT NULL, CONSTRAINT "PK_d85f411d0ae242db81426c8eb29" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "match_result" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "consumerId" text NOT NULL, "generatorId" text NOT NULL, "volume" text NOT NULL, "from" TIMESTAMP WITH TIME ZONE NOT NULL, "to" TIMESTAMP WITH TIME ZONE NOT NULL, "consumerMetadata" text NOT NULL, "generatorMetadata" text NOT NULL, CONSTRAINT "PK_a4450d3f8956bd21c5c916ff273" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "match_result"`);
        await queryRunner.query(`DROP TABLE "leftover_consumption"`);
        await queryRunner.query(`DROP TABLE "excess_generation"`);
    }
}
