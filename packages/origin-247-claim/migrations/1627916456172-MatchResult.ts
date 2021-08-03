import { MigrationInterface, QueryRunner } from 'typeorm';

export class MatchResult1627916456172 implements MigrationInterface {
    name = 'MatchResult1627916456172';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "match_result" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "firstEntityId" text NOT NULL, "secondEntityId" text NOT NULL, "volume" text NOT NULL, "from" TIMESTAMP WITH TIME ZONE NOT NULL, "to" TIMESTAMP WITH TIME ZONE NOT NULL, "firstEntityMetaData" text NOT NULL, "secondEntityMetaData" text NOT NULL, CONSTRAINT "PK_a4450d3f8956bd21c5c916ff273" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "match_result"`);
    }
}
