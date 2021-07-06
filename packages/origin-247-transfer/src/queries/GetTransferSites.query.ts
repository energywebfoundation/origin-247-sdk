import { IQueryHandler, IQuery } from '@nestjs/cqrs';

export interface IGetTransferSitesPayload {
    generatorId: string;
}

export class GetTransferSitesQuery implements IQuery {
    constructor(public readonly payload: IGetTransferSitesPayload) {}
}

export interface IGetTransferSitesQueryResponse {
    buyerId: string;
    sellerId: string;
}

export interface IGetTransferSitesQueryHandler
    extends IQueryHandler<GetTransferSitesQuery, IGetTransferSitesQueryResponse> {}
