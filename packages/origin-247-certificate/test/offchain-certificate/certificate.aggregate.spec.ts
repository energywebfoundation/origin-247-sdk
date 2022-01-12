import { CertificateAggregate } from '../../src/offchain-certificate/certificate.aggregate';
import {
    CertificateIssuedEvent,
    CertificateTransferredEvent,
    CertificateClaimedEvent,
    CertificateIssuancePersistedEvent,
    CertificateTransferPersistedEvent
} from '../../src/offchain-certificate/events/Certificate.events';
import { CertificateErrors } from '../../src/offchain-certificate/errors';

const issuedEvent = new CertificateIssuedEvent(1, {
    toAddress: '0x1',
    userId: '1',
    energyValue: '100',
    fromTime: 1637278545811 - 1000,
    toTime: 1637278545811,
    deviceId: 'firstDevice',
    metadata: {}
});

const transferredEvent = new CertificateTransferredEvent(1, {
    certificateId: 1,
    fromAddress: '0x1',
    toAddress: '0x2',
    energyValue: '100'
});

const smallTransferredEvent = new CertificateTransferredEvent(1, {
    certificateId: 1,
    fromAddress: '0x1',
    toAddress: '0x2',
    energyValue: '10'
});

const fromZeroTransferredEvent = new CertificateTransferredEvent(1, {
    certificateId: 1,
    fromAddress: '0x0',
    toAddress: '0x2',
    energyValue: '100'
});

const toZeroTransferredEvent = new CertificateTransferredEvent(1, {
    certificateId: 1,
    fromAddress: '0x1',
    toAddress: '0x0',
    energyValue: '100'
});

const tooBigValueTransferredEvent = new CertificateTransferredEvent(1, {
    certificateId: 1,
    fromAddress: '0x1',
    toAddress: '0x2',
    energyValue: '200'
});

const claimedEvent = new CertificateClaimedEvent(1, {
    certificateId: 1,
    claimData: {
        beneficiary: 'someBeneficiary',
        location: 'Radom',
        countryCode: 'PL',
        periodStartDate: '2021-11-18T08:00:00.000Z',
        periodEndDate: '2021-11-18T08:30:00.000Z',
        purpose: 'higher'
    },
    forAddress: '0x1',
    energyValue: '100'
});

const smallClaimedEvent = new CertificateClaimedEvent(1, {
    certificateId: 1,
    claimData: {
        beneficiary: 'someBeneficiary',
        location: 'Radom',
        countryCode: 'PL',
        periodStartDate: '2021-11-18T08:00:00.000Z',
        periodEndDate: '2021-11-18T08:30:00.000Z',
        purpose: 'higher'
    },
    forAddress: '0x1',
    energyValue: '10'
});

const forZeroAddressClaimedEvent = new CertificateClaimedEvent(1, {
    certificateId: 1,
    claimData: {
        beneficiary: 'someBeneficiary',
        location: 'Radom',
        countryCode: 'PL',
        periodStartDate: '2021-11-18T08:00:00.000Z',
        periodEndDate: '2021-11-18T08:30:00.000Z',
        purpose: 'higher'
    },
    forAddress: '0x0',
    energyValue: '100'
});

const tooBigValueClaimedEvent = new CertificateClaimedEvent(1, {
    certificateId: 1,
    claimData: {
        beneficiary: 'someBeneficiary',
        location: 'Radom',
        countryCode: 'PL',
        periodStartDate: '2021-11-18T08:00:00.000Z',
        periodEndDate: '2021-11-18T08:30:00.000Z',
        purpose: 'higher'
    },
    forAddress: '0x1',
    energyValue: '200'
});

const issuancePersistedEvent = new CertificateIssuancePersistedEvent(1, {
    blockchainCertificateId: 1,
    persistedEventId: -1
});

const transferPersistedEvent = new CertificateTransferPersistedEvent(1, {
    persistedEventId: -1
});

describe('CertificateAggregate', () => {
    describe('creation', () => {
        it('should create aggregate from events', () => {
            const aggregate = CertificateAggregate.fromEvents([
                issuedEvent,
                smallTransferredEvent,
                smallTransferredEvent,
                smallClaimedEvent,
                smallClaimedEvent
            ]);
            expect(aggregate.getCertificate()).toMatchObject({
                internalCertificateId: 1,
                blockchainCertificateId: null,
                claims: [
                    {
                        from: '0x1',
                        to: '0x1',
                        topic: '',
                        value: '10',
                        claimData: {
                            beneficiary: 'someBeneficiary',
                            location: 'Radom',
                            countryCode: 'PL',
                            periodStartDate: '2021-11-18T08:00:00.000Z',
                            periodEndDate: '2021-11-18T08:30:00.000Z',
                            purpose: 'higher'
                        }
                    },
                    {
                        from: '0x1',
                        to: '0x1',
                        topic: '',
                        value: '10',
                        claimData: {
                            beneficiary: 'someBeneficiary',
                            location: 'Radom',
                            countryCode: 'PL',
                            periodStartDate: '2021-11-18T08:00:00.000Z',
                            periodEndDate: '2021-11-18T08:30:00.000Z',
                            purpose: 'higher'
                        }
                    }
                ],
                creationBlockHash: '',
                deviceId: 'firstDevice',
                generationStartTime: 1637278544811,
                generationEndTime: 1637278545811,
                metadata: {},
                owners: {
                    '0x1': '60',
                    '0x2': '20'
                },
                claimers: {
                    '0x1': '20'
                }
            });
        });

        it('should create aggregate from unordered events', () => {
            const aggregate = CertificateAggregate.fromEvents([
                new CertificateTransferredEvent(1, {
                    certificateId: 1,
                    fromAddress: '0x1',
                    toAddress: '0x2',
                    energyValue: '100'
                }),
                issuedEvent
            ]);

            expect(aggregate.getCertificate()).toMatchObject({
                internalCertificateId: 1,
                blockchainCertificateId: null,
                claims: [],
                creationBlockHash: '',
                deviceId: 'firstDevice',
                generationStartTime: 1637278544811,
                generationEndTime: 1637278545811,
                metadata: {},
                owners: {
                    '0x1': '0',
                    '0x2': '100'
                },
                claimers: {}
            });
        });

        it('should throw error when certificate was not issued beforehand', () => {
            const getAggregate = () => CertificateAggregate.fromEvents([transferredEvent]);
            expect(getAggregate).toThrow(CertificateErrors.FirstCertificateEventIsNotIssuance);
        });

        it('should throw error if no events were provided', () => {
            const getAggregate = () => CertificateAggregate.fromEvents([]);
            expect(getAggregate).toThrow(CertificateErrors.CertificateNoEvents);
        });
    });

    describe('Issue', () => {
        it('should throw an error when certificate is issued twice', () => {
            const getAggregate = () => CertificateAggregate.fromEvents([issuedEvent, issuedEvent]);
            expect(getAggregate).toThrow(CertificateErrors.Issuance.CertificateAlreadyIssued);
        });

        it('should issue a certificate', () => {
            const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
            expect(aggregate.getCertificate()).toMatchObject({
                internalCertificateId: 1,
                blockchainCertificateId: null,
                claims: [],
                creationBlockHash: '',
                deviceId: 'firstDevice',
                generationStartTime: 1637278544811,
                generationEndTime: 1637278545811,
                metadata: {},
                owners: { '0x1': '100' },
                claimers: {}
            });
        });

        it('should persist blockchain id upon persistance', () => {
            const certificate = CertificateAggregate.fromEvents([
                issuedEvent,
                issuancePersistedEvent
            ]).getCertificate();

            expect(certificate.blockchainCertificateId).toBe(1);
        });
    });

    describe('Transfer', () => {
        it('should apply transfer when from account has enough balance', () => {
            const aggregate = CertificateAggregate.fromEvents([issuedEvent, transferredEvent]);

            expect(aggregate.getCertificate()).toMatchObject({
                internalCertificateId: 1,
                blockchainCertificateId: null,
                claims: [],
                creationBlockHash: '',
                deviceId: 'firstDevice',
                generationStartTime: 1637278544811,
                generationEndTime: 1637278545811,
                metadata: {},
                owners: {
                    '0x1': '0',
                    '0x2': '100'
                },
                claimers: {}
            });
        });

        it('should throw error when from account is zero address', () => {
            const getAggregate = () =>
                CertificateAggregate.fromEvents([issuedEvent, fromZeroTransferredEvent]);

            expect(getAggregate).toThrow(CertificateErrors.Transfer.FromZeroAddress);
        });

        it('should throw error when to account is zero address', () => {
            const getAggregate = () =>
                CertificateAggregate.fromEvents([issuedEvent, toZeroTransferredEvent]);

            expect(getAggregate).toThrow(CertificateErrors.Transfer.ToZeroAddress);
        });

        it('should throw error when from account has not enough balance', () => {
            const getAggregate = () =>
                CertificateAggregate.fromEvents([issuedEvent, tooBigValueTransferredEvent]);

            expect(getAggregate).toThrow(CertificateErrors.Transfer.NotEnoughBalance);
        });

        it('should transfer all available balance when no energyValue is spiecified', () => {
            const noValuetransferredEvent = new CertificateTransferredEvent(1, {
                certificateId: 1,
                fromAddress: '0x1',
                toAddress: '0x2'
            });

            const aggregate = CertificateAggregate.fromEvents([
                issuedEvent,
                noValuetransferredEvent
            ]);

            expect(aggregate.getCertificate()).toMatchObject({
                internalCertificateId: 1,
                blockchainCertificateId: null,
                claims: [],
                creationBlockHash: '',
                deviceId: 'firstDevice',
                generationStartTime: 1637278544811,
                generationEndTime: 1637278545811,
                metadata: {},
                owners: {
                    '0x1': '0',
                    '0x2': '100'
                },
                claimers: {}
            });
        });

        it('it should throw error when there is no energyValue and no owned volume', () => {
            const noVolumestransferredEvent = new CertificateTransferredEvent(1, {
                certificateId: 1,
                fromAddress: '0x2',
                toAddress: '0x3'
            });

            const getAggregate = () =>
                CertificateAggregate.fromEvents([issuedEvent, noVolumestransferredEvent]);

            expect(getAggregate).toThrow(CertificateErrors.Transfer.NotEnoughBalance);
        });
    });

    describe('Claim', () => {
        it('should apply claim when for account has enough balance', () => {
            const aggregate = CertificateAggregate.fromEvents([issuedEvent, claimedEvent]);

            expect(aggregate.getCertificate()).toMatchObject({
                internalCertificateId: 1,
                blockchainCertificateId: null,
                claims: [
                    {
                        from: '0x1',
                        to: '0x1',
                        topic: '',
                        value: '100',
                        claimData: {
                            beneficiary: 'someBeneficiary',
                            location: 'Radom',
                            countryCode: 'PL',
                            periodStartDate: '2021-11-18T08:00:00.000Z',
                            periodEndDate: '2021-11-18T08:30:00.000Z',
                            purpose: 'higher'
                        }
                    }
                ],
                creationBlockHash: '',
                deviceId: 'firstDevice',
                generationStartTime: 1637278544811,
                generationEndTime: 1637278545811,
                metadata: {},
                owners: {
                    '0x1': '0'
                },
                claimers: {
                    '0x1': '100'
                }
            });
        });

        it('should throw error when forAccount is zero address', () => {
            const getAggregate = () =>
                CertificateAggregate.fromEvents([issuedEvent, forZeroAddressClaimedEvent]);

            expect(getAggregate).toThrow(CertificateErrors.Claim.ForZeroAddress);
        });

        it('should throw error when forAccount has not enough balance', () => {
            const getAggregate = () =>
                CertificateAggregate.fromEvents([issuedEvent, tooBigValueClaimedEvent]);

            expect(getAggregate).toThrow(CertificateErrors.Claim.NotEnoughBalance);
        });

        it('should claim all available balance when no energyValue was specified', () => {
            const claimedEvent = new CertificateClaimedEvent(1, {
                certificateId: 1,
                claimData: {
                    beneficiary: 'someBeneficiary',
                    location: 'Radom',
                    countryCode: 'PL',
                    periodStartDate: '2021-11-18T08:00:00.000Z',
                    periodEndDate: '2021-11-18T08:30:00.000Z',
                    purpose: 'higher'
                },
                forAddress: '0x1'
            });

            const aggregate = CertificateAggregate.fromEvents([issuedEvent, claimedEvent]);

            expect(aggregate.getCertificate()).toMatchObject({
                internalCertificateId: 1,
                blockchainCertificateId: null,
                claims: [
                    {
                        from: '0x1',
                        to: '0x1',
                        topic: '',
                        value: '100',
                        claimData: {
                            beneficiary: 'someBeneficiary',
                            location: 'Radom',
                            countryCode: 'PL',
                            periodStartDate: '2021-11-18T08:00:00.000Z',
                            periodEndDate: '2021-11-18T08:30:00.000Z',
                            purpose: 'higher'
                        }
                    }
                ],
                creationBlockHash: '',
                deviceId: 'firstDevice',
                generationStartTime: 1637278544811,
                generationEndTime: 1637278545811,
                metadata: {},
                owners: {
                    '0x1': '0'
                },
                claimers: {
                    '0x1': '100'
                }
            });
        });

        it('it should throw error when there is no energyValue and no owned volume', () => {
            const claimedEvent = new CertificateClaimedEvent(1, {
                certificateId: 1,
                claimData: {
                    beneficiary: 'someBeneficiary',
                    location: 'Radom',
                    countryCode: 'PL',
                    periodStartDate: '2021-11-18T08:00:00.000Z',
                    periodEndDate: '2021-11-18T08:30:00.000Z',
                    purpose: 'higher'
                },
                forAddress: '0x2'
            });

            const geAggregate = () => CertificateAggregate.fromEvents([issuedEvent, claimedEvent]);

            expect(geAggregate).toThrow(CertificateErrors.Claim.NotEnoughBalance);
        });
    });

    describe('isSynced', () => {
        it('should properly compute if there are events to persist', () => {
            const certificate1 = CertificateAggregate.fromEvents([issuedEvent]).getCertificate();

            const certificate2 = CertificateAggregate.fromEvents([
                issuedEvent,
                transferredEvent
            ]).getCertificate();

            const certificate3 = CertificateAggregate.fromEvents([
                issuedEvent,
                issuancePersistedEvent,
                transferredEvent
            ]).getCertificate();

            expect(certificate1.isSynced).toBe(false);
            expect(certificate2.isSynced).toBe(false);
            expect(certificate3.isSynced).toBe(false);
        });

        it('should properly compute if all events are persisted', () => {
            const certificate1 = CertificateAggregate.fromEvents([
                issuedEvent,
                issuancePersistedEvent
            ]).getCertificate();

            const certificate2 = CertificateAggregate.fromEvents([
                issuedEvent,
                issuancePersistedEvent,
                transferredEvent,
                transferPersistedEvent
            ]).getCertificate();

            expect(certificate1.isSynced).toBe(true);
            expect(certificate2.isSynced).toBe(true);
        });
    });
});
