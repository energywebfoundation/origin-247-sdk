import { PrimaryColumn, Entity } from 'typeorm';

export const tableName = 'certificate_deployment_properties';
@Entity(tableName)
export class DeploymentPropertiesEntity {
    @PrimaryColumn()
    registry: string;
}
