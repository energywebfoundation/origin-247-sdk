import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeploymentProperties } from '../../types';
import { DeploymentPropertiesEntity } from './deploymentProperties.entity';
import { DeploymentPropertiesRepository } from './deploymentProperties.repository';

@Injectable()
export class DeploymentPropertiesPostgresRepository implements DeploymentPropertiesRepository {
    constructor(
        @InjectRepository(DeploymentPropertiesEntity)
        private repository: Repository<DeploymentPropertiesEntity>
    ) {}

    public async get(): Promise<DeploymentProperties> {
        const [properties] = await this.repository.find();
        if (!properties) {
            throw new Error('No deployment properties');
        }
        return properties;
    }

    public async save(properties: DeploymentProperties): Promise<void> {
        if (await this.propertiesExist()) {
            throw new Error('Deployment properties already exist');
        }
        await this.repository.save(properties);
    }

    public async propertiesExist(): Promise<boolean> {
        const [properties] = await this.repository.find();
        return properties ? true : false;
    }
}
