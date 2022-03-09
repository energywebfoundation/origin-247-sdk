import { PrimaryColumn, Entity } from 'typeorm';

export const tableName = 'deployment_properties';
@Entity(tableName)
export class DeploymentPropertiesEntity {
    @PrimaryColumn()
    registry: string;
}
