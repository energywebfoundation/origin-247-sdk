# Origin 24/7 SDK - Certificate module

Certificate module (and its `CertificateService`) allow to issue, transfer and claim certificates.

It enqueues and batches transactions, which is required for optimal blockchain work.

## Specific requirements

Despite typical 24/7 SDK requirements and setup, you will need

-   Redis (For enqueueing we use [bull](https://github.com/OptimalBits/bull) package)

## Installation

For NestJS Bull please consult: https://docs.nestjs.com/techniques/queues and setup `BullModule.forRoot`. The rest is done by `origin-247-certificate`.

Also for migrations, please add entry to your `package.json` scripts section:

`"typeorm:run:issuer": "node_modules/typeorm/cli.js migration:run --config node_modules/@energyweb/issuer-api/dist/js/ormconfig.js",`

Which allows to run migration required by the module.

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
import { CertificateService } from '@energyweb/origin-247-certificate';

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
