import { BigNumber } from 'ethers';

export enum TransferValidationStatus {
    Pending = 'pending',
    Valid = 'valid',
    Invalid = 'invalid',
    Error = 'error'
}

export interface IUpdateStatusResult {
    success: boolean;
    message?: string;
}

export enum UpdateStatusCode {
    Success = 'success',
    NoValidator = 'noValidator',
    NotPending = 'notPending'
}

export interface CertificateData {
    generatorId: string;
    fromTime: string;
    toTime: string;
    metadata: any; // not stringified at this point
}

export interface EnergyTransferRequestPublicAttrs {
    id: number;
    sellerAddress: string;
    buyerAddress: string;
    transferDate: Date;
    volume: string;
    certificateData: CertificateData;
}

export enum State {
    Skipped = 'Skipped',
    IssuanceAwaiting = 'IssuanceAwaiting',
    IssuanceInProgress = 'IssuanceInProgress',
    Issued = 'Issued',
    PersistenceAwaiting = 'PersistenceAwaiting',
    Persisted = 'Persisted',
    ValidationAwaiting = 'ValidationAwaiting',
    ValidationInProgress = 'ValidationInProgress',
    Validated = 'Validated',
    TransferAwaiting = 'TransferAwaiting',
    TransferInProgress = 'TransferInProgress',
    Transferred = 'Transferred',

    // Computed states
    IssuanceError = 'IssuanceError',
    TransferError = 'TransferError',
    ValidationError = 'ValidationError',
    ValidationInvalid = 'ValidationInvalid'
}

interface StateTransition {
    [State.IssuanceAwaiting]: [State.IssuanceInProgress];
    [State.IssuanceInProgress]: [State.Issued, State.IssuanceError];
    [State.Issued]: [State.PersistenceAwaiting];
    [State.PersistenceAwaiting]: [State.Persisted];
    [State.Persisted]: [State.ValidationAwaiting];
    [State.ValidationAwaiting]: [State.ValidationInProgress];
    [State.ValidationInProgress]: [State.Validated, State.ValidationError, State.ValidationInvalid];
    [State.Validated]: [State.TransferAwaiting];
    [State.TransferAwaiting]: [State.TransferInProgress];
    [State.TransferInProgress]: [State.Transferred, State.TransferError];
}

export interface EnergyTransferRequestAttrs extends EnergyTransferRequestPublicAttrs {
    createdAt: Date;
    updatedAt: Date;

    certificateId: number | null;
    state: State;
    processError: string | null;

    validationStatusRecord: Record<string, TransferValidationStatus>;
}

export interface NewAttributesParams {
    buyerAddress: string;
    sellerAddress: string;
    transferDate: Date;
    volume: string;
    certificateData: CertificateData;
}

export class EnergyTransferRequest {
    private constructor(private attrs: EnergyTransferRequestAttrs) {}

    public get certificateId() {
        return this.attrs.certificateId;
    }

    public get id() {
        return this.attrs.id;
    }

    public get sites() {
        return {
            buyerAddress: this.attrs.buyerAddress,
            sellerAddress: this.attrs.sellerAddress
        };
    }

    public get volume() {
        return this.attrs.volume;
    }

    public issuanceStarted() {
        this.nextState(State.IssuanceAwaiting, State.IssuanceInProgress);
    }

    public issuanceError(error: string) {
        this.nextState(State.IssuanceInProgress, State.IssuanceError);
        this.attrs.processError = error;
    }

    public issuanceFinished(certificateId: number) {
        this.nextState(State.IssuanceInProgress, State.Issued);
        this.attrs.certificateId = certificateId;

        this.nextState(State.Issued, State.PersistenceAwaiting);
    }

    public persisted() {
        this.nextState(State.PersistenceAwaiting, State.Persisted);
        this.nextState(State.Persisted, State.ValidationAwaiting);
    }

    public startValidation(validatorNames: string[]): void {
        this.nextState(State.ValidationAwaiting, State.ValidationInProgress);

        if (validatorNames.length === 0) {
            this.nextState(State.ValidationInProgress, State.Validated);
            this.nextState(State.Validated, State.TransferAwaiting);

            return;
        }

        this.attrs.validationStatusRecord = validatorNames.reduce(
            (status, command) => ({
                ...status,
                [command]: TransferValidationStatus.Pending
            }),
            {} as EnergyTransferRequestAttrs['validationStatusRecord']
        );
    }

    public validationError(error: string) {
        this.nextState(State.ValidationInProgress, State.ValidationError);
        this.attrs.processError = error;
    }

    public updateValidationStatus(
        validatorName: string,
        status: TransferValidationStatus
    ): UpdateStatusCode {
        const currentStatus = this.attrs.validationStatusRecord[validatorName];

        if (!currentStatus) {
            return UpdateStatusCode.NoValidator;
        }

        if (currentStatus !== TransferValidationStatus.Pending) {
            /**
             * This may happen randomly if for example we have asymmetric validator,
             * that instantly updates validation status after we start validation
             */

            return UpdateStatusCode.NotPending;
        }

        this.attrs.validationStatusRecord[validatorName] = status;

        // Update ETR state only if its validation is in progress
        // Because validation results may arrive after some validator already marked ETR as invalid/error
        if (this.attrs.state === State.ValidationInProgress) {
            const statuses = Object.values(this.attrs.validationStatusRecord);

            if (statuses.some((s) => s === TransferValidationStatus.Error)) {
                this.nextState(State.ValidationInProgress, State.ValidationError);
            } else if (statuses.some((s) => s === TransferValidationStatus.Invalid)) {
                this.nextState(State.ValidationInProgress, State.ValidationInvalid);
            } else if (statuses.every((s) => s === TransferValidationStatus.Valid)) {
                this.nextState(State.ValidationInProgress, State.Validated);
                this.nextState(State.Validated, State.TransferAwaiting);
            } // in any other case state is not changed (for example something is still pending)
        }

        return UpdateStatusCode.Success;
    }

    public transferStarted() {
        this.nextState(State.TransferAwaiting, State.TransferInProgress);
    }

    public transferError(error: string) {
        this.nextState(State.TransferAwaiting, State.TransferInProgress);
        this.attrs.processError = error;
    }

    public transferFinished() {
        this.nextState(State.TransferInProgress, State.Transferred);
    }

    public toAttrs(): EnergyTransferRequestAttrs {
        return this.attrs;
    }

    public toPublicAttrs(): EnergyTransferRequestPublicAttrs {
        return {
            buyerAddress: this.attrs.buyerAddress,
            sellerAddress: this.attrs.sellerAddress,
            id: this.attrs.id,
            transferDate: this.attrs.transferDate,
            volume: this.attrs.volume,
            certificateData: this.attrs.certificateData
        };
    }

    public static fromAttrs(attrs: EnergyTransferRequestAttrs): EnergyTransferRequest {
        return new EnergyTransferRequest(attrs);
    }

    public static newAttributes(
        params: NewAttributesParams
    ): Omit<EnergyTransferRequestAttrs, 'id'> {
        return {
            ...params,
            createdAt: new Date(),
            updatedAt: new Date(),
            certificateId: null,
            validationStatusRecord: {},
            state: BigNumber.from(params.volume).eq(0) ? State.Skipped : State.IssuanceAwaiting,
            processError: null
        };
    }

    /**
     * This method works like super simple state machine.
     * It ensures correct current state at runtime (because it's impossible to check this in compilation time),
     * and ensures correct next state in compilation time (because it's much better DX).
     *
     * Any runtime error here indicates a bug.
     */
    private nextState<T extends keyof StateTransition, P extends StateTransition[T]>(
        expectedCurrentState: T,
        nextState: P extends (infer R)[] ? R : never
    ) {
        if (this.attrs.state !== expectedCurrentState) {
            throw new Error(
                `ETR ${this.attrs.id} is in invalid state to execute method. Expected ${expectedCurrentState}, current: ${this.attrs.state}`
            );
        }

        this.attrs.state = nextState;
    }
}
