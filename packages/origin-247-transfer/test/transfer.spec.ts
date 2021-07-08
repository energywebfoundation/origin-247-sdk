import { CommandHandler } from '@nestjs/cqrs';
import { TransferValidationStatus, IValidateTransferCommandHandler } from '../src';
import { publishStart, setup, waitForPersistance, waitForEvent, waitForValidation } from './setup';

jest.setTimeout(10000);

/**
 * @WARN - times in these tests are fine tuned to provide expected results
 * Since many things are happening through CQRS module there is no other way.
 */

describe('Transfer module', () => {
    it.concurrent('should create ETR with given sites and data', async () => {
        const { app, queryBus, commandBus, eventBus, repository } = await setup({
            sites: { buyerId: 'buyer1', sellerId: 'seller1' },
            commands: []
        });

        await app.init();
        await publishStart(eventBus);
        await waitForPersistance();

        const request = await repository.findByCertificateId(1);

        expect(request?.toAttrs()).toEqual(
            expect.objectContaining({
                volume: '60',
                generatorId: 'a1',
                buyerId: 'buyer1',
                sellerId: 'seller1'
            })
        );

        await app.close();
    });

    it.concurrent('should mark ETR as persisted', async () => {
        const { app, queryBus, commandBus, eventBus, repository } = await setup({
            sites: { buyerId: 'buyer1', sellerId: 'seller1' },
            commands: []
        });

        await app.init();
        await publishStart(eventBus);

        const requestBefore = await repository.findByCertificateId(1);
        expect(requestBefore?.toAttrs().isCertificatePersisted).toBe(false);

        await waitForPersistance();

        const requestAfter = await repository.findByCertificateId(1);
        expect(requestAfter?.toAttrs().isCertificatePersisted).toBe(true);

        await app.close();
    });

    it.concurrent('should save all validations as pending before starting validating', async () => {
        class Command1 {}
        class Command2 {}

        @CommandHandler(Command1)
        class Command1Handler implements IValidateTransferCommandHandler {
            async execute() {
                await waitForValidation();
                return { validationResult: TransferValidationStatus.Valid };
            }
        }

        @CommandHandler(Command2)
        class Command2Handler implements IValidateTransferCommandHandler {
            async execute() {
                await waitForValidation();
                return { validationResult: TransferValidationStatus.Valid };
            }
        }

        const { app, queryBus, commandBus, eventBus, repository } = await setup({
            sites: { buyerId: 'buyer1', sellerId: 'seller1' },
            commands: [Command1, Command2],
            providers: [Command1Handler, Command2Handler]
        });

        await app.init();
        await publishStart(eventBus);
        await waitForPersistance();

        const request = await repository.findByCertificateId(1);
        expect(request?.toAttrs().validationStatus).toEqual({
            Command1: TransferValidationStatus.Pending,
            Command2: TransferValidationStatus.Pending
        });

        await app.close();
    });

    it.concurrent(
        'should immediately save validation error if command handler is not defined',
        async () => {
            class Command1 {}
            class Command2 {}

            @CommandHandler(Command1)
            class Command1Handler implements IValidateTransferCommandHandler {
                async execute() {
                    await waitForValidation();
                    return { validationResult: TransferValidationStatus.Valid };
                }
            }

            const { app, queryBus, commandBus, eventBus, repository } = await setup({
                sites: { buyerId: 'buyer1', sellerId: 'seller1' },
                commands: [Command1, Command2],
                providers: [Command1Handler]
            });

            await app.init();
            await publishStart(eventBus);
            await waitForPersistance();

            const request = await repository.findByCertificateId(1);
            expect(request?.toAttrs().validationStatus).toEqual({
                Command1: TransferValidationStatus.Pending,
                Command2: TransferValidationStatus.Error
            });

            await app.close();
        }
    );

    it.concurrent(
        'should save validation results - and dont send event if not all is valid',
        async () => {
            class Command1 {}
            class Command2 {}

            @CommandHandler(Command1)
            class Command1Handler implements IValidateTransferCommandHandler {
                async execute() {
                    return { validationResult: TransferValidationStatus.Valid };
                }
            }

            @CommandHandler(Command2)
            class Command2Handler implements IValidateTransferCommandHandler {
                async execute() {
                    return { validationResult: TransferValidationStatus.Invalid };
                }
            }

            const {
                app,
                queryBus,
                commandBus,
                eventBus,
                repository,
                validateEventHandler
            } = await setup({
                sites: { buyerId: 'buyer1', sellerId: 'seller1' },
                commands: [Command1, Command2],
                providers: [Command1Handler, Command2Handler]
            });

            await app.init();
            await publishStart(eventBus);
            await waitForPersistance();

            const request = await repository.findByCertificateId(1);
            expect(request?.toAttrs().validationStatus).toEqual({
                Command1: TransferValidationStatus.Valid,
                Command2: TransferValidationStatus.Invalid
            });

            expect(validateEventHandler).not.toBeCalled();

            await app.close();
        }
    );

    it.concurrent('should send event if all is valid', async () => {
        class Command1 {}
        class Command2 {}

        @CommandHandler(Command1)
        class Command1Handler implements IValidateTransferCommandHandler {
            async execute() {
                return { validationResult: TransferValidationStatus.Valid };
            }
        }

        @CommandHandler(Command2)
        class Command2Handler implements IValidateTransferCommandHandler {
            async execute() {
                return { validationResult: TransferValidationStatus.Valid };
            }
        }

        const {
            app,
            queryBus,
            commandBus,
            eventBus,
            repository,
            validateEventHandler
        } = await setup({
            sites: { buyerId: 'buyer1', sellerId: 'seller1' },
            commands: [Command1, Command2],
            providers: [Command1Handler, Command2Handler]
        });

        await app.init();
        await publishStart(eventBus);
        await waitForPersistance();

        const request = await repository.findByCertificateId(1);
        expect(request?.toAttrs().validationStatus).toEqual({
            Command1: TransferValidationStatus.Valid,
            Command2: TransferValidationStatus.Valid
        });

        expect(validateEventHandler).toBeCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    requestId: request?.id
                })
            })
        );

        await app.close();
    });
});
