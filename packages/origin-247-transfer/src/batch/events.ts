import { IEvent } from '@nestjs/cqrs';

export class AwaitingTransferEvent implements IEvent {}
export class AwaitingIssuanceEvent implements IEvent {}
export class AwaitingValidationEvent implements IEvent {}
