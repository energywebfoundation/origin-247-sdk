<p align="center">
  <a href="https://www.energyweb.org" target="blank"><img src="./energyweb.png" width="120" alt="Energy Web Foundation" /></a>
</p>

# Origin 24/7 SDK - Transfer module

## Description

Transfer module is responsible for accepting input (the generation event),
issuing certificate for such generation, and then calling series of validators to verify if the certificate issuance is valid to be transferred to the buyer.

For example:

1. There are two sites using _application_: _seller_ and _buyer_
2. Seller owns generation device, and wants to sell energy to the buyer (by transferring certificate)
3. Application receives information, that generation happened. It passes this information to `origin-247-transfer` module.
4. `origin-247-transfer` module asks application for sites for the transfer. If such sites are found, certificate is issued for the seller.
5. If sites are equal validation and transfer are skipped. Otherwise `origin-247-transfer` after ensuring that certificate has been issued asks application to verify the trade (there are various methods to do that)
6. Application informs `origin-247-transfer` that trade is valid.
7. `origin-247-transfer` transfers certificate from seller to buyer.

## Requirements

-   Nest.js application (`origin-247-transfer` is Nest.js module)
-   TypeORM configured

## Installation

1. Setup [certificate module](../origin-247-certificate) - this module is used by `transfer` module.
2. Install `@energyweb/origin-247-transfer`
3. Add `EnergyTransferRequestEntity` to your `TypeORM.forRoot` entities.
4. Run migrations on startup:

    ```json
    // package.json
    {
        "scripts": {
            "typeorm:run:transfer": "node_modules/typeorm/cli.js migration:run --config node_modules/@energyweb/origin-247-transfer/dist/js/ormconfig.js"
        }
    }
    ```

5. Import transfer module to the root of your application:

```ts
import { TransferModule } from '@energyweb/origin-247-transfer';

@Module({
    imports: [
        TransferModule.register({
            validateCommands: [
                /** More on that later in README */
            ]
        })
    ]
})
export class RootModule {}
```

## Usage

Please make sure you are familiar with [NestJS CQRS module](https://docs.nestjs.com/recipes/cqrs).

All required files are exported from `@energyweb/origin-247-transfer`;

1. Send event to CQRS event bus:

```ts
@Injectable()
class MyService {
    constructor(private eventBus: EventBus) {}

    public sendEvent() {
        // Note, that this payload more-or-less will be later on used
        // during validation or sites query
        this.eventBus.publish(
            new GenerationReadingStoredEvent({
                generatorId: 'myGeneratorId', // id of your generation device
                fromTime: new Date(), // generation time window start
                toTime: new Date(), // generation time window end
                transferDate: new Date(), // transfer date that will be saved for any usage
                energyValue: '1642', // energy value in any unit you like
                metadata: null // See @energyweb/origin-247-certificate for more info on that
            })
        );
    }
}
```

2. Implement query handler for retrieving transfer sites `IGetTransferSitesQueryHandler` (remember, it has to be added to some module's providers):

```ts
@QueryHandler(GetTransferSitesQuery)
class SitesQueryHandler implements IGetTransferSitesQueryHandler {
    async execute({ generatorId }: GetTransferSitesQuery) {
        // You can return `null` here. If null is returned
        // then transfer is aborted
        return {
            // Blockchain addresses of site participating in trade
            buyerAddress: '0xeF99b2A55E6D070bA2D12f79b368148BF7d6Fc10',
            sellerAddress: '0x212fb883109dC887a605B09078E219Db75e5AAc7'
        };
    }
}
```

3. (optional) Implement validators. If no validators are given, transfer is considered valid. Each validator is a Command, and requires CommandHandler. Validators can be either _symmetric_ or _asymmetric_. Symmetric validator returns validation result immediately after being called (sync or async), while asymmetric validator returns `pending` status. You can call `UpdateTransferValidationCommand` manually later on, if you are able to verify the transfer. Available validation statuses are: `Valid`, `Invalid` and `Pending`. `Error` is used internally, but can be useful for application as well.

```ts
/** Commands are called with energy transfer request attributes */

// export interface EnergyTransferRequestPublicAttrs {
//  id: number;
//  generatorId: string;
//  sellerAddress: string;
//  buyerAddress: string;
//  volume: string;
//  transferDate: Date;
// }

export class SymmetricValidationCommand {
    constructor(public payload: EnergyTransferRequestPublicAttrs) {}
}

export class AsymmetricValidationCommand {
    constructor(public payload: EnergyTransferRequestPublicAttrs) {}
}
```

```ts
/** Command handlers for commands defined above */

@CommandHandler(SymmetricValidationCommand)
export class Command1Handler implements IValidateTransferCommandHandler {
    async execute() {
        return { validationResult: TransferValidationStatus.Valid };
    }
}

@CommandHandler(AsymmetricValidationCommand)
export class Command2Handler implements IValidateTransferCommandHandler {
    constructor(private commandBus: CommandBus) {}

    async execute(command: AsymmetricValidationCommand) {
        /** It updates status asymmetrically after 5s */
        setTimeout(() => {
            this.commandBus.execute(
                new UpdateTransferValidationCommand({
                    requestId: command.payload.id,
                    status: TransferValidationStatus.Valid,
                    // Validators are identified by their class name
                    validatorName: AsymmetricValidationCommand.name
                })
            );
        }, 5000);

        return { validationResult: TransferValidationStatus.Pending };
    }
}
```

4. Register your command handlers in module of your application, and add validator commands to `TransferModule.register` options:

```ts
TransferModule.register({
    validateCommands: [SymmetricValidationCommand, AsymmetricValidationCommand]
});
```

5. Add `typeorm:run:transfer` to package.json, and run it which runs module migrations:

```
"typeorm:run:transfer": "node_modules/typeorm/cli.js migration:run --config node_modules/@energyweb/origin-247-transfer/dist/js/ormconfig.js",
```

6. Call `GenerationReadingStoredEvent` created in step 1. that triggers whole transfer process. You may also want to consult test `setup` files in this repository, that although complex, may give a hint in case of any problems.

## Additional resources

### Testing applications with TransferModule

`TransferModuleForUnitTest` is exported, that uses `CertificateForUnitTestsModule` (`247-sdk`) and in-memory repositories to simplify testing,
so no configuration for `CertificateModule` is necessary (like blockchain or redis configuration), and no database setup.

### Caching

`origin-247-transfer` module makes use of caching, for some purposes. [Official NestJS technique](https://docs.nestjs.com/techniques/caching) is used for that.
By default it uses in-memory cache, but for production use it is best to actually use persistent store for that, otherwise some ETRs may hang on `PersistanceAwaiting` state.

To use Redis as cache storage for this module, configure `REDIS_URL` variable, and install `"cache-manager-ioredis": "2.1.0"` as dependency in your application.
If those two things are present Redis will be used automatically as storage.

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
