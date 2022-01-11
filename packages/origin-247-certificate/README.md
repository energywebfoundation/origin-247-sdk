# Origin 24/7 SDK - Certificate module

Certificate module (and its `OnChainCertificateService`) allow to issue, transfer and claim certificates.

It enqueues and batches transactions, which is required for optimal blockchain work.

It also exposes off-chain implementation, that stores everything in local database, and (on request) synchronizes
everything to blockchain. This implementation is described in [OffChain Module](#offchain-module) section.

**It is advised to go through whole README carefully**

## Specific requirements

Despite typical 24/7 SDK requirements and setup, you will need

-   Redis (For enqueueing we use [bull](https://github.com/OptimalBits/bull) package)

## Installation

**If you were redirected here from `origin-247-claim` or `origin-247-transfer` modules,
please apply [OffChain Module](#offchain-module) section installation (**and usage\*\* (manual blockchain synchronization in particular)) as well.

0. Add peer runtime dependencies: `yarn add @energyweb/issuer @energyweb/issuer-api`
1. For NestJS Bull please consult: https://docs.nestjs.com/techniques/queues and setup `BullModule.forRoot`.
2. For migrations, please add entry to your `package.json` scripts section:

`"typeorm:run:issuer": "node_modules/typeorm/cli.js migration:run --config node_modules/@energyweb/issuer-api/dist/js/ormconfig.js",`

Which allows to run migration required by the module.

3. Add TypeORM entities:

```ts
import { entities as IssuerEntities } from '@energyweb/issuer-api';

[...]

TypeOrmModule.forRoot({
  ...
  entities: [
    ...,
    ...IssuerEntities,
  ],
  ...
});
```

## Usage

Import Certificate module into one of your applications modules:

```ts
import { OnChainCertificateModule } from '@energyweb/origin-247-certificate';

@Module({
    imports: [OnChainCertificateModule]
})
export class SomeModule {}
```

Use the service:

```ts
import { OnChainCertificateService, ONCHAIN_CERTIFICATE_SERVICE_TOKEN } from '@energyweb/origin-247-certificate';

/**
 * Because certificate entity allows to store custom data called "metadata"
 * user can provide typing for metadata.
 *
 * See README metadata section for more information.
 */
interface IMetadata {
  myCustomCertificateData: string;
}

export class SomeService {
  constructor(
    @Inject(ONCHAIN_CERTIFICATE_SERVICE_TOKEN)
    private certificateService: OnChainCertificateService<IMetadata>
  ) {}

  public async issueRandomCertificate(): Promise<void> {
    await this.certificateService.issue({
      ...
    });
  }
}
```

### Metadata

Each certificate is able to store _metadata_ information, which is used for storing
custom payloads.

Therefore all certificate types (including service) imported from the module give user the ability to provide interface/type for that metadata (as generic type). This way metadata stays typed across application. It's best to create this type somewhere and reuse it across application.

Metadata is serialized internally via `JSON.stringify` therefore metadata **has to** be serializable.
Any value accepted by `JSON.stringify` can be used as metadata (including null - which is default value for metadata field)

### Environment configuration

| Variable name                     | Default value    | Description                                                                                                                      |
| --------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `CERTIFICATE_QUEUE_LOCK_DURATION` | 240 \* 1000 [ms] | How long processor can lock given queue item before marking it stale (stalled queue items are rerun again) - change with caution |
| `CERTIFICATE_QUEUE_DELAY`         | 10 \* 1000 [ms]  | How long each queue item should wait before finishing it's processing - helps with some transaction nonce problems               |

### Notes

1. If one item of batch fails, then whole batch fails.

### Testing

Use `OnChainCertificateForUnitTestsModule` (instead of regular module) which abstracts away whole `issuer-api`, blockchain, database and Redis dependencies. This implementation stores certificates in memory. It is not bullet-proof (because it's really simple), but should handle most happy-paths.

## OffChain Module

OffChain module allows to store everything in local database (therefore making any changes immediate),
and then on-request to synchronize it with a blockchain (internally it uses `OnChainCertificateModule` for that).

### Installation

0. Apply regular installation instructions described above.
1. Besides `issuer-api` entities you need to import `OffChainCertificateEntities` entities, and add them to `TypeORM.forRoot`
2. You need to run migrations from `origin-247-certificate`, e.g.

```
"typeorm:run:transfer": "node_modules/typeorm/cli.js migration:run --config node_modules/@energyweb/origin-247-certificate/dist/js/ormconfig.js",
```

3. Import `OffChainCertificateModule` wherever you want to use `OffChainCertificateService` or `BlockchainSynchronizationService`.

### Usage

`OffChainCertificateService` exposes interface identical to on-chain version.
The only difference is returned certificate interface. It returns _read model_, which is off-chain representation.

It has two fields: `internalCertificateId: number` and `blockchainCertificateId: number | null` instead of one `certificateId`. `internalCertificateId` is used for any communication through `OffChainCertificateService`. But if you want to find certificate in `OnChainCertificateService` you need to use `blockchainCertificateId` which is it's on-chain id. `blockchainCertificateId` can be null if it was not synchronized yet.

**Synchronization doesn't happen automatically.** You need to manually call `BlockchainSynchronizationService.synchronize` in your application. This gives you the flexibility to synchronize everything in cron or manually after some set of events happen.

Off-chain implementation performs few retries if _persisting_ events on blockchain fails (e.g. due to network problems)

### Testing

Just as with `OnChain` module, you can import `OffChainCertificateForUnitTestsModule`.
