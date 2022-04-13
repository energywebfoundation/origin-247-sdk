<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="./energyweb.png" width="120" alt="Energy Web Foundation" /></a>
</p>

# Origin 24/7 SDK - Claim module

## Description

`origin-247-claim` module is responsible for matching generations with consumptions, and claiming certificates on the blockchain.
It also stores matching results.

## Requirements

-   Nest.js application (`origin-247-claim` is Nest.js module)
-   TypeORM configured

## Installation

1. Setup [origin-247-certificate](https://github.com/energywebfoundation/origin-247-sdk/tree/master/packages/origin-247-certificate) `OffChainCertificateModule`
2. Install `@energyweb/origin-247-claim`
3. Import `ClaimModule` into your application:

```ts
import { ClaimModule } from '@energyweb/origin-247-claim';

@Module({
    imports: [ClaimModule]
})
export class SomeModule {}
```

4. Add `entities` to `TypeORM.forRoot` entities:

```ts
import { entities as ClaimEntitites } from '@energyweb/origin-247-claim';

...
TypeORM.forRoot({
  entities: [
    ...ClaimEntitites
  ]
})
```

5. Run migrations on startup:

```json
// package.json
{
    "scripts": {
        "typeorm:run:claim": "node_modules/typeorm/cli.js migration:run --config node_modules/@energyweb/origin-247-claim/dist/js/ormconfig.js"
    }
}
```

## Usage

1. Import `ClaimModule` module
2. Inject `ClaimFacade` into your service, and use it to perform matching and get matching results.

### Claiming example

```ts
await this.claimFacade.claim({
    algorithmFn: matchAlgorithm({
        // imported from `@energyweb/origin-247-claim` and customized, details later on
        buyingPriority,
        cfeTargets,
        sellingPriority
    }),
    claimCustomizationFn: (
        matches // before doing the claiming you need to match certain interface
    ) =>
        matches.map((match) => ({
            certificateId: match.generation.certificateId,
            energyValue: match.volume.toString(),
            claimData: {
                beneficiary: consumers.find((c) => c.meterId === match.consumption.consumerId)!.did,
                countryCode: '',
                location: '',
                periodEndDate: '',
                periodStartDate: '',
                purpose: ''
            },
            forAddress: sellerAddress
        })),
    data: {
        consumptions,
        generations
    },
    timeframe: timeFrame // this time frame will be saved in matching results
});
```

## Notes

### Claiming algorithm

Any algorithm can be used as an input to `.claim` function, as long as it meets [interface](./src/interfaces.ts).
Any additional fields present on `IConsumption` or `IGeneration` (besides those defined in interface), that will be returned as matches from matching algorithm,
will be saved as result metadata.

By default we expose some algorithms ready to be used

1. `SpreadMatcher.spreadMatcher` - very customizable algorithm, supporting prioritization, and spreading matches equally over devices of equal priority.

### Matching results

Using `.findMatches`, `.findLeftoverConsumption`, `.findExcessGeneration` you can query for any devices and timeframes, and receive raw data,
that later on can be aggregated. Metadata field is explained above.

### Testing applications with ClaimModule

`ClaimForUnitTestsModule` is exported, that uses `CertificateForUnitTestsModule` (`247-sdk`) and in-memory repositories to simplify testing,
so no configuration for `CertificateModule` is necessary (like blockchain or redis configuration), and no database setup.

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
