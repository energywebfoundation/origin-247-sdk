import { ConnectionOptions } from 'typeorm';
import { getConfiguration } from './src/config/configuration';

const getDBConnectionOptions = (): ConnectionOptions => {
    const configuration = getConfiguration();

    return configuration.DATABASE_URL
        ? {
              type: 'postgres',
              url: configuration.DATABASE_URL,
              ssl: {
                  rejectUnauthorized: false
              }
          }
        : {
              type: 'postgres',
              host: configuration.DB_HOST,
              port: configuration.DB_PORT,
              username: configuration.DB_USERNAME,
              password: configuration.DB_PASSWORD,
              database: configuration.DB_DATABASE
          };
};

const config: ConnectionOptions = {
    ...getDBConnectionOptions(),
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
    migrationsRun: true,
    migrations: ['migrations/*.ts'],
    migrationsTableName: 'migrations_247_certificate',
    cli: {
        migrationsDir: 'migrations'
    }
};

export = config;
