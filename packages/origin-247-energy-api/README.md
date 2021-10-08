# Origin 24/7 SDK - Energy API module

Energy API module is responsible for managing meter readings.
It can accept readings, for which [precise proofs](https://github.com/energywebfoundation/precise-proofs) are created.
The readings themselves are stored in [Influx DB](https://github.com/energywebfoundation/energy-api/tree/master/packages/energy-api-influxdb).

Module is built to be used with 24/7 applications, that utilize [https://github.com/energywebfoundation/origin](https://github.com/energywebfoundation/origin) and other 24/7 packages.

Important information:

1. It saves proof request to database, and waits some time to collect more readings,
   that can be batched under one proof (one proof can contain one deviceId, but many readings).
2. It queues proof issuance to avoid transaction conflicts.
3. In case of any error during creating proofs, it's saved in database. Successfully processed requests are removed from database.
4. Reading timestamp is rounded down to seconds

## Installation

1. Import `EnergyApi247Module` into your application:

```ts
import { EnergyApi247Module } from '@energyweb/origin-247-energy-api';

@Module({
    imports: [EnergyApi247Module]
})
export class SomeModule {}
```

2. Add `entities` to `TypeORM.forRoot` entities:

```ts
import { entities as EnergyApiEntities } from '@energyweb/origin-247-energy-api';

...
TypeORM.forRoot({
  entities: [
    ...EnergyApiEntities
  ]
})
```

3. Run migrations on startup:

```json
// package.json
{
    "scripts": {
        "typeorm:run:energy-api": "node_modules/typeorm/cli.js migration:run --config node_modules/@energyweb/origin-247-energy-api/dist/js/ormconfig.js"
    }
}
```

4. Add necessary configuration environment variables (for [Origin Energy API Influx DB](https://github.com/energywebfoundation/energy-api/tree/master/packages/energy-api-influxdb)):

```
# --- SMART METER READINGS --- #
INFLUXDB_URL=http://localhost:8086
INFLUXDB_TOKEN=admin:admin
INFLUXDB_ORG=
INFLUXDB_BUCKET=energy/autogen

# Optional for influxdb-init.sh script
INFLUXDB_DB=energy
INFLUXDB_ADMIN_USER=admin
INFLUXDB_ADMIN_PASSWORD=admin
INFLUXDB_USER=api
INFLUXDB_USER_PASSWORD=secretpassword

# Blockchain - deploy key is used for managing proofs on blockchain
WEB3=http://localhost:8545
DEPLOY_KEY=0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

## Usage

1. Import module (as in installation step)
2. Inject `EnergyApi247Facade` into your service, and use it to store readings and access readings or proofs.
3. Using `ReadingProofProcessedEvent` (from [NestJS CQRS](https://docs.nestjs.com/recipes/cqrs) event bus) you can listen to reading batch being processed and react on that.

### Configuration

Environment variables

1. `ENERGY_REQUEST_PROCESS_AGGREGATE_SECONDS` - default 10 - how long application should wait to aggregate as many readings into batch as possible
