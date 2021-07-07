import { ValidateTransferCommandCtor } from './commands/ValidateTransferCommand';

export enum TransferValidationStatus {
    Pending = 'pending',
    Valid = 'valid',
    Invalid = 'invalid',
    Error = 'error'
}

export interface EnergyTransferRequestAttrs {
    id: number;
    createdAt: Date;
    updatedAt: Date;

    generatorId: string;
    sellerId: string;
    buyerId: string;
    volume: string;

    certificateId: number | null;
    isCertificatePersisted: boolean;

    validationStatus: Record<string, TransferValidationStatus>;
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
            buyerId: this.attrs.buyerId,
            sellerId: this.attrs.sellerId
        };
    }

    public isValid(): boolean {
        return Object.values(this.attrs.validationStatus).every(
            (status) => status === TransferValidationStatus.Valid
        );
    }

    public updateCertificateId(certificateId: number): void {
        this.attrs.certificateId = certificateId;
    }

    public markCertificatePersisted(): void {
        this.attrs.isCertificatePersisted = true;
    }

    public startValidation(validationCommands: ValidateTransferCommandCtor[]): void {
        this.attrs.validationStatus = validationCommands.reduce(
            (status, command) => ({
                ...status,
                [command.name]: TransferValidationStatus.Pending
            }),
            {} as EnergyTransferRequestAttrs['validationStatus']
        );
    }

    public updateValidationStatus(commandName: string, status: TransferValidationStatus): void {
        const currentStatus = this.attrs.validationStatus[commandName];

        if (currentStatus !== TransferValidationStatus.Pending) {
            throw new Error(
                `Cannot update status of transfer request: ${this.attrs.id} to ${status}, because it already has status ${currentStatus}`
            );
        }

        this.attrs.validationStatus[commandName] = status;
    }

    public toAttrs(): EnergyTransferRequestAttrs {
        return this.attrs;
    }

    public static fromAttrs(attrs: EnergyTransferRequestAttrs): EnergyTransferRequest {
        return new EnergyTransferRequest(attrs);
    }
}
