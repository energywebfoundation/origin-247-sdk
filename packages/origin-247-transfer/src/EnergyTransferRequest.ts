export interface EnergyTransferRequest {
    id: number;
    createdAt: Date;
    updatedAt: Date;

    generatorId: string;
    sellerId: string;
    buyerId: string;
    volume: string;

    certificateId: number | null;
    isCertificatePersisted: boolean;
}
