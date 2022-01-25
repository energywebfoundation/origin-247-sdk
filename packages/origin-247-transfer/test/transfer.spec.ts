import {
    TransferValidationStatus,
    State,
    EnergyTransferRequestAttrs,
    IValidateTransferCommandHandler
} from '../src';
import { publishStart, setup } from './setup';
import { CommandHandler } from '@nestjs/cqrs';

jest.setTimeout(30 * 1000);

const wait = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));
const sellerAddress = '0xc1912fee45d61c87cc5ea59dae31190fffff232d';
const buyerAddress = '0x29D7d1dd5B6f9C864d9db560D72a247c178aE86B';

describe('Transfer module', () => {
    it('creates ETR with given sites and data', async () => {
        await doTest(
            {
                commands: [],
                handlers: {}
            },
            (etr) => {
                expect(etr).toEqual(
                    expect.objectContaining({
                        volume: '60',
                        sellerAddress,
                        buyerAddress
                    })
                );
            }
        );
    });

    it('does not create ETR if no sites are returned', async () => {
        const { app, eventBus, getEtr } = await setup({
            sites: null,
            commands: []
        });

        await app.init();

        publishStart(eventBus);
        await wait(1);

        const request = await getEtr();

        expect(request).toBeNull();

        await app.close();
    });

    it('it validates using provided validators', async () => {
        await doTest(
            {
                commands: ['Command1', 'Command2'],
                handlers: {
                    Command1: TransferValidationStatus.Valid,
                    Command2: TransferValidationStatus.Invalid
                }
            },
            (etr) => {
                expect(etr.state).toEqual(State.ValidationInvalid);
                expect(etr.validationStatusRecord).toEqual({
                    Command1: TransferValidationStatus.Valid,
                    Command2: TransferValidationStatus.Invalid
                });
            }
        );
    });

    it('saves validation error if command handler is not defined', async () => {
        await doTest(
            {
                commands: ['Command1', 'Command2'],
                handlers: {
                    Command1: TransferValidationStatus.Valid
                }
            },
            (etr) => {
                expect(etr.validationStatusRecord).toEqual({
                    Command1: TransferValidationStatus.Valid,
                    Command2: TransferValidationStatus.Error
                });

                expect(etr.state).toBe(State.ValidationError);
            }
        );
    });

    it('transfers etr if no commands are defined', async () => {
        await doTest(
            {
                commands: [],
                handlers: {}
            },
            (etr) => {
                expect(etr.state).toBe(State.Transferred);
            }
        );
    });

    it('transfers etr with commands defined', async () => {
        await doTest(
            {
                commands: ['Command1', 'Command2'],
                handlers: {
                    Command1: TransferValidationStatus.Valid,
                    Command2: TransferValidationStatus.Valid
                }
            },
            (etr) => {
                expect(etr.state).toBe(State.Transferred);
            }
        );
    });
});

interface DoTestData {
    commands: string[];
    handlers: Record<string, TransferValidationStatus>;
}

const doTest = async (data: DoTestData, cb: (etr: EnergyTransferRequestAttrs) => void) => {
    class Command1 {}
    class Command2 {}

    @CommandHandler(Command1)
    class Command1Handler implements IValidateTransferCommandHandler {
        async execute() {
            return { validationResult: data.handlers['Command1'] };
        }
    }

    @CommandHandler(Command2)
    class Command2Handler implements IValidateTransferCommandHandler {
        async execute() {
            return { validationResult: data.handlers['Command2'] };
        }
    }

    const commandMap = {
        Command1: Command1,
        Command2: Command2
    };

    const handlerMap = {
        Command1: Command1Handler,
        Command2: Command2Handler
    };

    const { app, eventBus, getEtr } = await setup({
        sites: {
            sellerAddress,
            buyerAddress
        },
        commands: data.commands.map((cmd) => commandMap[cmd]),
        providers: Object.keys(data.handlers).map((cmd) => handlerMap[cmd])
    });

    await app.init();

    publishStart(eventBus);
    await wait(10);

    const etr = (await getEtr())?.toAttrs();

    cb(etr);

    await app.close();
};
