<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="./energyweb.png" width="120" alt="Energy Web Foundation" /></a>
</p>

# Origin 24/7 SDK - Energy API module

## Description

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

## Requirements

-   Nest.js application (`origin-247-energy-api` is Nest.js module)
-   TypeORM configured
-   InfluxDB (v1 or v2)

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
2. `DEPLOY_KEY` - required - used for managing proofs on blockchain. Note, that it cannot be the same as issuer key used in `origin-247-certificate`, because otherwise transactions will conflict.
3. `WEB3` - required - RPC address to which proofs will be published

## Questions and Support

For questions and support please use Energy Web's [Discord channel](https://discord.com/channels/706103009205288990/843970822254362664)

Or reach out to our contributing team members

-   TeamMember: email address@energyweb.org

## EW-DOS

The Energy Web Decentralized Operating System is a blockchain-based, multi-layer digital infrastructure.

The purpose of EW-DOS is to develop and deploy an open and decentralized digital operating system for the energy sector in support of a low-carbon, customer-centric energy future.

We develop blockchain technology, full-stack applications and middleware packages that facilitate participation of Distributed Energy Resources on the grid and create open market places for transparent and efficient renewable energy trading.

-   To learn about more about the EW-DOS tech stack, see our [documentation](https://app.gitbook.com/@energy-web-foundation/s/energy-web/).

-   For an overview of the energy-sector challenges our use cases address, go [here](https://app.gitbook.com/@energy-web-foundation/s/energy-web/our-mission).

For a deep-dive into the motivation and methodology behind our technical solutions, we encourage you to read our White Papers:

-   [Energy Web White Paper on Vision and Purpose](https://www.energyweb.org/reports/EWDOS-Vision-Purpose/)
-   [Energy Web White Paper on Technology Detail](https://www.energyweb.org/wp-content/uploads/2020/06/EnergyWeb-EWDOS-PART2-TechnologyDetail-202006-vFinal.pdf)

## Connect with Energy Web

-   [Twitter](https://twitter.com/energywebx)
-   [Discord](https://discord.com/channels/706103009205288990/843970822254362664)
-   [Telegram](https://t.me/energyweb)
