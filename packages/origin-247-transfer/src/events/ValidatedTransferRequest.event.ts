export interface ValidatedTransferRequestPayload {
    requestId: number;
}

export class ValidatedTransferRequestEvent {
    constructor(public payload: ValidatedTransferRequestPayload) {}
}
