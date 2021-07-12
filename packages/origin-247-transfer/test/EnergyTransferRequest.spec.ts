import { EnergyTransferRequest, TransferValidationStatus } from '../src';

describe('Energy Transfer Request', () => {
    describe('computedValidationStatus', () => {
        const expectStatus = (etr: EnergyTransferRequest, status: TransferValidationStatus) => {
            expect(etr.toAttrs().computedValidationStatus).toBe(status);
        };

        const createEtr = (validators = ['validator1', 'validator2']) => {
            const etr = EnergyTransferRequest.fromAttrs({
                id: 1,
                ...EnergyTransferRequest.newAttributes({
                    buyerAddress: '',
                    generatorId: '',
                    sellerAddress: '',
                    transferDate: new Date(),
                    volume: ''
                })
            });

            etr.startValidation(validators);

            return etr;
        };

        it('starts with pending status', () => {
            const etr = createEtr();

            expectStatus(etr, TransferValidationStatus.Pending);
        });

        it('starts with valid status if is created with empty validators', () => {
            const etr = createEtr([]);

            expectStatus(etr, TransferValidationStatus.Valid);
        });

        it('properly updates valid status', () => {
            const etr = createEtr();

            etr.updateValidationStatus('validator1', TransferValidationStatus.Valid);
            expectStatus(etr, TransferValidationStatus.Pending);

            etr.updateValidationStatus('validator2', TransferValidationStatus.Valid);
            expectStatus(etr, TransferValidationStatus.Valid);
        });

        it('properly updates error status', () => {
            const etr1 = createEtr();

            etr1.updateValidationStatus('validator1', TransferValidationStatus.Valid);
            expectStatus(etr1, TransferValidationStatus.Pending);

            etr1.updateValidationStatus('validator2', TransferValidationStatus.Error);
            expectStatus(etr1, TransferValidationStatus.Error);
        });

        it('properly updates invalid status', () => {
            const etr = createEtr();

            etr.updateValidationStatus('validator1', TransferValidationStatus.Valid);
            expectStatus(etr, TransferValidationStatus.Pending);

            etr.updateValidationStatus('validator2', TransferValidationStatus.Invalid);
            expectStatus(etr, TransferValidationStatus.Invalid);
        });

        it('immediately sets invalid or error statuses', () => {
            const etr1 = createEtr();

            etr1.updateValidationStatus('validator1', TransferValidationStatus.Error);
            expectStatus(etr1, TransferValidationStatus.Error);

            etr1.updateValidationStatus('validator2', TransferValidationStatus.Valid);
            expectStatus(etr1, TransferValidationStatus.Error);

            const etr2 = createEtr();

            etr2.updateValidationStatus('validator1', TransferValidationStatus.Invalid);
            expectStatus(etr2, TransferValidationStatus.Invalid);

            etr2.updateValidationStatus('validator2', TransferValidationStatus.Pending);
            expectStatus(etr2, TransferValidationStatus.Invalid);
        });
    });

    describe('isValid', () => {
        const createEtr = (validators = ['validator1', 'validator2']) => {
            const etr = EnergyTransferRequest.fromAttrs({
                id: 1,
                ...EnergyTransferRequest.newAttributes({
                    buyerAddress: '',
                    generatorId: '',
                    sellerAddress: '',
                    transferDate: new Date(),
                    volume: ''
                })
            });

            etr.startValidation(validators);

            return etr;
        };

        it('is initially not valid', () => {
            const etr = createEtr();

            expect(etr.isValid()).toBe(false);
        });

        it('is initially valid if no validators are given', () => {
            const etr = createEtr([]);

            expect(etr.isValid()).toBe(true);
        });

        it('is true only if all are valid', () => {
            const etr = createEtr();

            etr.updateValidationStatus('validator1', TransferValidationStatus.Valid);
            expect(etr.isValid()).toBe(false);

            etr.updateValidationStatus('validator2', TransferValidationStatus.Valid);
            expect(etr.isValid()).toBe(true);
        });

        it('is not true if any of validators is not valid', () => {
            const etr = createEtr();

            etr.updateValidationStatus('validator1', TransferValidationStatus.Invalid);
            etr.updateValidationStatus('validator2', TransferValidationStatus.Valid);
            expect(etr.isValid()).toBe(false);
        });
    });
});
