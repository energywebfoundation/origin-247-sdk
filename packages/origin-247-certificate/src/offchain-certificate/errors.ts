export namespace CertificateErrors {
    export namespace Issuance {
        export class CertificateAlreadyIssued extends Error {
            constructor(internalCertificateId: number) {
                super(
                    `Issuance for internalCertificateId: ${internalCertificateId} failed. Certificate already issued.`
                );
            }
        }
    }

    export namespace Transfer {
        export class CertificateNotIssued extends Error {
            constructor(internalCertificateId: number) {
                super(
                    `Transfer for internalCertificateId: ${internalCertificateId} failed. Certificate was not issued.`
                );
            }
        }

        export class FromZeroAddress extends Error {
            constructor(internalCertificateId: number) {
                super(
                    `Transfer for internalCertificateId: ${internalCertificateId} failed. Transfer is from zero address(0x0).`
                );
            }
        }

        export class ToZeroAddress extends Error {
            constructor(internalCertificateId: number) {
                super(
                    `Transfer for internalCertificateId: ${internalCertificateId} failed. Transfer is to zero address(0x0).`
                );
            }
        }

        export class NotEnoughBalance extends Error {
            constructor(internalCertificateId, address) {
                super(
                    `Transfer for: ${internalCertificateId} failed. Address: ${address} has not enough balance.`
                );
            }
        }
    }

    export namespace Claim {
        export class CertificateNotIssued extends Error {
            constructor(internalCertificateId: number) {
                super(
                    `Claim for internalCertificateId: ${internalCertificateId} failed. Certificate was not issued.`
                );
            }
        }

        export class ForZeroAddress extends Error {
            constructor(internalCertificateId: number) {
                super(
                    `Claim for internalCertificateId: ${internalCertificateId} failed. Transfer is for zero address(0x0).`
                );
            }
        }

        export class NotEnoughBalance extends Error {
            constructor(internalCertificateId, address) {
                super(
                    `Claim for: ${internalCertificateId} failed. Address: ${address} has not enough balance.`
                );
            }
        }
    }
}
