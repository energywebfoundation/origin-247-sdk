<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="./energyweb.png" width="120" alt="Energy Web Foundation" /></a>
</p>

# Origin 24/7 SDK - Certificate module

## Description

Certificate module (and its `OnChainCertificateService`) allow to deploy contracts; issue, transfer and claim certificates.

It enqueues and batches transactions, which is required for optimal blockchain work.

It also exposes off-chain implementation, that stores everything in local database, and (on request) synchronizes
everything to blockchain. This implementation is described in [OffChain Module](#offchain-module) section.

**It is advised to go through whole README carefully**

## Requirements

-   Nest.js application (`origin-247-certificate` is Nest.js module)
-   TypeORM configured
-   Redis (for enqueueing we use [bull](https://github.com/OptimalBits/bull) package)

## Installation

\*\*If you were redirected here from `origin-247-claim` or `origin-247-transfer` modules,
please apply [OffChain Module](#offchain-module) section installation (and usage (manual blockchain synchronization in particular)) as well.

0. Add peer runtime dependencies: `yarn add @energyweb/issuer`
1. Setup `BullModule.forRoot` as described in Nest.js documentation: https://docs.nestjs.com/techniques/queues
2. Install `@energyweb/origin-247-certificate`
3. Add `OnChainCertificateEntities` to your `TypeORM.forRoot` entities.
4. You need to run migrations from `origin-247-certificate`, e.g.

```
"typeorm:run:certificate": "node_modules/typeorm/cli.js migration:run --config node_modules/@energyweb/origin-247-certificate/dist/js/ormconfig.js",
```

## OnChainCertificateModule

Make sure you have [certificates deployed](#deploying-and-migrating-contracts)

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

@Injectable()
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

### Deploying and migrating contracts

It is possible to deploy contracts using `OnChainCertificateFacade`. When using this method, it is unnecessary to do blockchain seeding migrations.

How to use:

0. Configure environment variables: `ISSUER_PRIVATE_KEY` (key for deployer), `WEB3` (RPC address)
1. Import certificate module into one of your applications modules
2. At application bootstrap, use `OnChainCertificateFacade.deploy()` method

```ts
import { OnChainCertificateFacade } from '@energyweb/origin-247-certificate';
// ...
const appModule = AppModule.register();
const app = await NestFactory.create(appModule);
const blockchainFacade = await app.resolve<OnChainCertificateFacade>(OnChainCertificateFacade);
await blockchainFacade.deploy();
```

or

```ts
import { OnChainCertificateFacade } from '@energyweb/origin-247-certificate';

@Module({
    imports: [OnChainCertificateModule]
})
export class AppModule {
    constructor(private onChangeCertificateFacade: OnChainCertificateFacade) {}

    public async onApplicationBootstrap() {
        await this.onChangeCertificateFacade.deploy();
    }
}
```

### Testing modules that import OnChainCertificateModule

Use `OnChainCertificateForUnitTestsModule` (instead of regular module) which abstracts away whole `issuer`, blockchain, database and Redis dependencies. This implementation stores certificates in memory. It is not bullet-proof (because it's really simple), but should handle most happy-paths.

## OffChain Module

OffChain module allows to store everything in local database (therefore making any changes immediate),
and then on-request to synchronize it with a blockchain (internally it uses `OnChainCertificateModule` for that).

### Installation

0. Apply `OnChainCertificateModule` installation instructions described above.
1. You need to import `OffChainCertificateEntities` entities, and add them to `TypeORM.forRoot`
2. Import `OffChainCertificateModule` wherever you want to use `OffChainCertificateService` or `BlockchainSynchronizationService`.

### Usage

`OffChainCertificateService` exposes interface extending on-chain version.
The main difference is the returned certificate interface. It returns _read model_, which is off-chain representation.

It has two fields: `internalCertificateId: number` and `blockchainCertificateId: number | null` instead of one `certificateId`. `internalCertificateId` is used for any communication through `OffChainCertificateService`. But if you want to find certificate in `OnChainCertificateService` you need to use `blockchainCertificateId` which is it's on-chain id. `blockchainCertificateId` can be null if it was not synchronized yet.

**Synchronization doesn't happen automatically.** You need to manually call `BlockchainSynchronizationService.synchronize` in your application. This gives you the flexibility to synchronize everything in cron or manually after some set of events happen.

Off-chain implementation performs few retries if _persisting_ events on blockchain fails (e.g. due to network problems)

## Additional resources

### Unit tests

If you want to unit test module, that imports `OnChainCertificateModule` or `OffChainCertificateModule`, you can import `OnChainCertificateForUnitTestsModule` or `OffChainCertificateForUnitTestsModule` instead.
They abstract away all dependencies (database, Redis, and others). These modules are not bullet-proof, but should be sufficient for testing most paths.

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
| `BLOCKCHAIN_POLLING_INTERVAL`     | 4000 [ms]        | How often blockchain should be polled for new events                                                                             |
| `ISSUER_PRIVATE_KEY`              | none             | Issuer private key used for deploying certificates                                                                               |
| `WEB3`                            | none             | RPC address - separate addresses with `;` to add fallback RPC                                                                    |

### Notes

1. If one item of batch fails, then whole batch fails.

## Questions and Support

For questions and support please use Energy Web's [Discord channel](https://discord.com/channels/706103009205288990/843970822254362664)

Or reach out to us via email: 247enquiries@energyweb.org

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
