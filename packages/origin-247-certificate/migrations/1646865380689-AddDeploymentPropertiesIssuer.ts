import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeploymentPropertiesIssuer1646865380690 implements MigrationInterface {
    name = 'AddDeploymentPropertiesIssuer1646865380690';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "certificate_deployment_properties" ADD "issuer" character varying`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "certificate_deployment_properties" DROP COLUMN "issuer"`
        );
    }
}
