import {
    EnergyTransferRequest,
    EnergyTransferRequestAttrs,
    State,
    TransferValidationStatus
} from '../src';

describe('Energy Transfer Request', () => {
    describe('computedValidationStatus', () => {
        const expectState = (etr: EnergyTransferRequest, state: State) => {
            expect(etr.toAttrs().state).toBe(state);
        };

        const createEtr = (attrs: Partial<EnergyTransferRequestAttrs> = {}) => {
            const etr = EnergyTransferRequest.fromAttrs({
                id: 1,
                ...EnergyTransferRequest.newAttributes({
                    buyerAddress: 'a',
                    sellerAddress: 'b',
                    transferDate: new Date(),
                    volume: '100',
                    certificateData: {
                        generatorId: '',
                        fromTime: new Date().toISOString(),
                        toTime: new Date().toISOString(),
                        metadata: null
                    }
                }),
                ...attrs
            });

            return etr;
        };

        it('has correct happy-path state flow - with two validators', () => {
            const etr = createEtr();

            expectState(etr, State.IssuanceAwaiting);
            expect(etr.certificateId).toBe(null);

            etr.issuanceStarted();
            expectState(etr, State.IssuanceInProgress);

            etr.issuanceFinished(1);
            expectState(etr, State.PersistenceAwaiting);
            expect(etr.certificateId).toBe(1);

            etr.persisted();
            expectState(etr, State.ValidationAwaiting);

            etr.startValidation(['validator1', 'validator2']);
            expectState(etr, State.ValidationInProgress);

            etr.updateValidationStatus('validator1', TransferValidationStatus.Valid);
            expectState(etr, State.ValidationInProgress);

            etr.updateValidationStatus('validator2', TransferValidationStatus.Valid);
            expectState(etr, State.TransferAwaiting); // it immediately goes to being transferred

            etr.transferStarted();
            expectState(etr, State.TransferInProgress);

            etr.transferFinished();
            expectState(etr, State.Transferred);
        });

        it('immediately goes to Skipped status if created if no volume', () => {
            const etr = EnergyTransferRequest.fromAttrs({
                id: 1,
                ...EnergyTransferRequest.newAttributes({
                    buyerAddress: 'a',
                    sellerAddress: 'b',
                    transferDate: new Date(),
                    volume: '0',
                    certificateData: {
                        generatorId: '',
                        fromTime: new Date().toISOString(),
                        toTime: new Date().toISOString(),
                        metadata: null
                    }
                })
            });

            expectState(etr, State.Skipped);
        });

        it('immediately goes to TransferAwaiting status if created with empty validators', () => {
            const etr = createEtr();

            etr.issuanceStarted();
            etr.issuanceFinished(1);
            etr.persisted();
            etr.startValidation([]);

            expectState(etr, State.TransferAwaiting);
        });

        it('properly updates error status', () => {
            const etr = createEtr();

            etr.issuanceStarted();
            etr.issuanceFinished(1);
            etr.persisted();
            etr.startValidation(['validator1', 'validator2']);

            etr.updateValidationStatus('validator1', TransferValidationStatus.Valid);
            expectState(etr, State.ValidationInProgress);

            etr.updateValidationStatus('validator2', TransferValidationStatus.Error);
            expectState(etr, State.ValidationError);
        });

        it('properly updates error status', () => {
            const etr = createEtr();

            etr.issuanceStarted();
            etr.issuanceFinished(1);
            etr.persisted();
            etr.startValidation(['validator1', 'validator2']);

            etr.updateValidationStatus('validator1', TransferValidationStatus.Valid);
            expectState(etr, State.ValidationInProgress);

            etr.updateValidationStatus('validator2', TransferValidationStatus.Invalid);
            expectState(etr, State.ValidationInvalid);
        });

        it('immediately sets validator error status', () => {
            const etr = createEtr();

            etr.issuanceStarted();
            etr.issuanceFinished(1);
            etr.persisted();
            etr.startValidation(['validator1', 'validator2']);

            etr.updateValidationStatus('validator1', TransferValidationStatus.Error);
            expectState(etr, State.ValidationError);

            etr.updateValidationStatus('validator2', TransferValidationStatus.Invalid);
            expectState(etr, State.ValidationError);
        });

        it('immediately sets validator invalid status', () => {
            const etr = createEtr();

            etr.issuanceStarted();
            etr.issuanceFinished(1);
            etr.persisted();
            etr.startValidation(['validator1', 'validator2']);

            etr.updateValidationStatus('validator1', TransferValidationStatus.Invalid);
            expectState(etr, State.ValidationInvalid);

            etr.updateValidationStatus('validator2', TransferValidationStatus.Error);
            expectState(etr, State.ValidationInvalid);
        });

        it('skips validation if addresses are the same', () => {
            const etr = createEtr({
                buyerAddress: 'a',
                sellerAddress: 'a'
            });

            etr.issuanceStarted();
            etr.issuanceFinished(1);
            etr.persisted();

            expectState(etr, State.ValidationSkipped);
        });
    });
});
