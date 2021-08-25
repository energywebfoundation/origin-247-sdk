# Origin 24/7 SDK - Certificate module

Certificate module (and its `CertificateService`) allow to issue, transfer and claim certificates.

It enqueues and batches transactions, which is required for optimal blockchain work.

## Specific requirements

Despite typical 24/7 SDK requirements and setup, you will need

-   Redis (For enqueueing we use [bull](https://github.com/OptimalBits/bull) package)

## Installation

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
import { CertificateModule } from '@energyweb/origin-247-certificate';

@Module({
    imports: [CertificateModule]
})
export class SomeModule {}
```

Use the service:

```ts
import { CertificateService, CERTIFICATE_SERVICE_TOKEN } from '@energyweb/origin-247-certificate';

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
    @Inject(CERTIFICATE_SERVICE_TOKEN)
    private certificateService: CertificateService<IMetadata>
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
