import { Inject, Injectable } from '@nestjs/common';
import { CertificateService, CERTIFICATE_SERVICE_TOKEN } from '@energyweb/origin-247-certificate';
import {
    EnergyTransferRequestRepository,
    ENERGY_TRANSFER_REQUEST_REPOSITORY
} from './repositories/EnergyTransferRequest.repository';
import { GenerationReadingStoredPayload } from './events/GenerationReadingStored.event';
import { QueryBus } from '@nestjs/cqrs';
import {
    GetTransferSitesQuery,
    IGetTransferSitesQueryResponse
} from './queries/GetTransferSites.query';
import { Logger } from '@nestjs/common';

interface IIssueCommand extends GenerationReadingStoredPayload<unknown> {}

@Injectable()
export class TransferService {
    private readonly logger = new Logger(TransferService.name);

    constructor(
        @Inject(CERTIFICATE_SERVICE_TOKEN)
        private certificateService: CertificateService<unknown>,
        @Inject(ENERGY_TRANSFER_REQUEST_REPOSITORY)
        private energyTransferRequestRepository: EnergyTransferRequestRepository,
        private queryBus: QueryBus
    ) {}

    public async issue(command: IIssueCommand): Promise<void> {
        const {
            generatorId,
            energyValue,
            fromTime,
            ownerBlockchainAddress,
            toTime,
            metadata
        } = command;

        const sites: IGetTransferSitesQueryResponse = await this.queryBus.execute(
            new GetTransferSitesQuery({ generatorId })
        );

        const request = await this.energyTransferRequestRepository.createNew({
            buyerId: sites.buyerId,
            sellerId: sites.sellerId,
            volume: energyValue,
            generatorId
        });

        const certificate = await this.certificateService.issue({
            deviceId: generatorId,
            energyValue: energyValue,
            fromTime,
            toTime,
            userId: ownerBlockchainAddress,
            toAddress: ownerBlockchainAddress,
            metadata
        });

        await this.energyTransferRequestRepository.updateWithCertificateId({
            requestId: request.id,
            certificateId: certificate.id
        });

        // There is a risk of race condition between `issue` finish and `CertificatePersistedEvent`
        // If certificate is already persisted (it can be found by service)
        // Then we should proceed as we received the event

        const isCertificatePersisted = Boolean(
            await this.certificateService.getById(certificate.id)
        );

        if (isCertificatePersisted) {
            await this.persistRequestCertificate(certificate.id);
        }
    }

    public async persistRequestCertificate(certificateId: number) {
        const request = await this.energyTransferRequestRepository.findByCertificateId(
            certificateId
        );

        if (!request) {
            this.logger.warn(`
                No transfer request found for certificate: ${certificateId}.
                This can mean, that there was a race condition, and CertificatePersisted event was received,
                before we could save the certificate id on ETR.

                This is not a problem since there is a fallback for that.
            `);

            return;
        }

        await this.energyTransferRequestRepository.updateWithPersistedCertificate(request.id);
    }
}
