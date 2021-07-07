import { ValidateTransferCommandCtor } from './commands/ValidateTransferCommand';

export enum TransferValidationStatus {
    Pending = 'pending',
    Valid = 'valid',
    Invalid = 'invalid'
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

    public updateCertificateId(certificateId: number) {
        this.attrs.certificateId = certificateId;
    }

    public markCertificatePersisted() {
        this.attrs.isCertificatePersisted = true;
    }

    public startValidation(validationCommands: ValidateTransferCommandCtor[]) {
        this.attrs.validationStatus = validationCommands.reduce(
            (status, command) => ({
                ...status,
                [command.name]: TransferValidationStatus.Pending
            }),
            {} as EnergyTransferRequestAttrs['validationStatus']
        );
    }

    public toAttrs(): EnergyTransferRequestAttrs {
        return this.attrs;
    }

    public static fromAttrs(attrs: EnergyTransferRequestAttrs): EnergyTransferRequest {
        return new EnergyTransferRequest(attrs);
    }
}
