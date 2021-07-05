export interface EnergyTransferBlock {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    sellerId: string;
    buyerId: string;
    volume: string;
    certificateId: number;
    isCertificatePersisted: boolean;
}
