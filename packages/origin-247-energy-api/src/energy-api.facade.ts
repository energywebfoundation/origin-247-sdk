import { Injectable } from '@nestjs/common';
import {
    ProofRequestService,
    RequestReadingProofPayload
} from './proof-request/proof-request.service';

@Injectable()
export class EnergyApi247Facade {
    constructor(private proofRequestService: ProofRequestService) {}

    public requestReadingProof(...payload: RequestReadingProofPayload[]) {
        return this.proofRequestService.requestReadingProof(...payload);
    }
}
