import { FilterDTO } from '@energyweb/energy-api-influxdb';
import { Inject, Injectable } from '@nestjs/common';
import {
    ProofRequestService,
    RequestReadingProofPayload
} from './proof-request/proof-request.service';
import { READ_SERVICE } from './reads/const';
import { ReadsService } from './reads/reads.service';

@Injectable()
export class EnergyApi247Facade {
    constructor(
        private proofRequestService: ProofRequestService,
        @Inject(READ_SERVICE)
        private readService: ReadsService
    ) {}

    public requestReadingProof(...payload: RequestReadingProofPayload[]) {
        return this.proofRequestService.requestReadingProof(...payload);
    }

    public findReadings(meterId: string, filter: FilterDTO) {
        return this.readService.findWithProof(meterId, filter);
    }
}
