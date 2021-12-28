# Origin 24/7 SDK - Claim module

`origin-247-claim` module is responsible for matching generations with consumptions, and claiming certificates on the blockchain.
It also stores matching results.

## Installation

0. Install `@energyweb/origin-247-claim` and [origin-247-certificate](https://github.com/energywebfoundation/origin-247-sdk/tree/master/packages/origin-247-certificate)
1. Import `ClaimModule` into your application:

```ts
import { ClaimModule } from '@energyweb/origin-247-claim';

@Module({
    imports: [ClaimModule]
})
export class SomeModule {}
```

2. Add `entities` to `TypeORM.forRoot` entities:

```ts
import { entities as ClaimEntitites } from '@energyweb/origin-247-claim';

...
TypeORM.forRoot({
  entities: [
    ...ClaimEntitites
  ]
})
```

3. Run migrations on startup:

```json
// package.json
{
    "scripts": {
        "typeorm:run:claim": "node_modules/typeorm/cli.js migration:run --config node_modules/@energyweb/origin-247-claim/dist/js/ormconfig.js"
    }
}
```

## Usage

1. Import module (as in installation step)
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

### Claiming algorithm

Any algorithm can be used as an input to `.claim` function, as long as it meets [interface](./src/interfaces.ts).
Any additional fields present on `IConsumption` or `IGeneration` (besides those defined in interface), that will be returned as matches from matching algorithm,
will be saved as result metadata.

By default we expose some algorithms ready to be used

1. `SpreadMatcher.spreadMatcher` - very customizable algorithm, supporting prioritization, and spreading matches equally over devices of equal priority.

### Matching results

Using `.findMatches`, `.findLeftoverConsumption`, `.findExcessGeneration` you can query for any devices and timeframes, and receive raw data,
that later on can be aggregated. Metadata field is explained above.

## Testing applications with ClaimModule

`ClaimForUnitTestsModule` is exported, that uses `CertificateForUnitTestsModule` (`247-sdk`) and in-memory repositories to simplify testing,
so no configuration for `CertificateModule` is necessary (like blockchain or redis configuration), and no database setup.
