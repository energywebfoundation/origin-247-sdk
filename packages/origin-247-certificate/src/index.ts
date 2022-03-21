import { CertificateEventEntity } from './offchain-certificate/repositories/CertificateEvent/CertificateEvent.entity';
import { CertificateCommandEntity } from './offchain-certificate/repositories/CertificateCommand/CertificateCommand.entity';
import { CertificateReadModelEntity } from './offchain-certificate/repositories/CertificateReadModel/CertificateReadModel.entity';
import { CertificateSynchronizationAttemptEntity } from './offchain-certificate/repositories/CertificateEvent/CertificateSynchronizationAttempt.entity';
import { DeploymentPropertiesEntity } from './onchain-certificate/repositories/deploymentProperties/deploymentProperties.entity';
export { IGetAllCertificatesOptions } from './offchain-certificate/repositories/CertificateReadModel/CertificateReadModel.repository';

export * from './types';

export * from './onchain-certificate/onchain-certificate.module';
export * from './onchain-certificate/onchain-certificate.service';
export * from './onchain-certificate/onChainCertificateFacade';
export * from './onchain-certificate/types';
export * from './onchain-certificate/blockchain-properties.service';
export * from './onchain-certificate/deployContracts';

export * from './offchain-certificate/offchain-certificate.module';
export * from './offchain-certificate/offchain-certificate.service';
export * from './offchain-certificate/certificate.aggregate';
export * from './offchain-certificate/synchronize/blockchain-synchronize.service';
export * from './offchain-certificate/types';
export const OffChainCertificateEntities = [
    CertificateSynchronizationAttemptEntity,
    CertificateEventEntity,
    CertificateCommandEntity,
    CertificateReadModelEntity
];

export const OnChainCertificateEntities = [DeploymentPropertiesEntity];
