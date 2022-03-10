import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeploymentProperties1646865380689 implements MigrationInterface {
    name = 'AddDeploymentProperties1646865380689';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "certificate_deployment_properties" ("registry" character varying NOT NULL, CONSTRAINT "PK_0b3f711854067e456735f0d25eb" PRIMARY KEY ("registry"))`
        );
        await this.migrateBlockchainProperties(queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "certificate_deployment_properties"`);
    }

    private async migrateBlockchainProperties(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await this.blockchainPropertiesExist(queryRunner);
        if (tableExists) {
            const registry = await queryRunner.query(
                `SELECT registry from issuer_blockchain_properties;`
            );
            if (registry.length) {
                await this.addRegistry(queryRunner, registry[0].registry);
            }
        }
    }

    private async addRegistry(queryRunner: QueryRunner, registry: string): Promise<void> {
        await queryRunner.query(
            `INSERT INTO certificate_deployment_properties VALUES ('${registry}');`
        );
    }

    private async blockchainPropertiesExist(queryRunner: QueryRunner): Promise<boolean> {
        const exists = await queryRunner.query(`SELECT EXISTS (
            SELECT FROM 
                pg_tables
            WHERE 
                schemaname = 'public' AND 
                tablename  = 'issuer_blockchain_properties'
            );`);
        return exists[0].exists;
    }
}
