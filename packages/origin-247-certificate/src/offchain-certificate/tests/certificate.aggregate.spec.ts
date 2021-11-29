import { CertificateAggregate } from '../certificate.aggregate';
import {
    CertificateIssuedEvent,
    CertificateTransferredEvent,
    CertificateClaimedEvent
} from '../events/Certificate.events';
import { CertificateErrors } from '../errors';

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

const tooBigValueransferredEvent = new CertificateTransferredEvent(1, {
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

describe('CertificateAggregate', () => {
    describe('creation', () => {
        it('should create aggregate from empty events', () => {
            const aggregate = CertificateAggregate.fromEvents([]);
            expect(aggregate.getCertificate()).toBe(null);
        });

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
    });

    describe('Issue', () => {
        it('should throw an error when certificate is issued twice', () => {
            const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
            const apply = () => {
                aggregate.apply(issuedEvent);
            };
            expect(apply).toThrow(CertificateErrors.Issuance.CertificateAlreadyIssued);
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
    });

    describe('Transfer', () => {
        it('should throw error when certificate was not issued beforehand', () => {
            const apply = () => {
                const aggregate = CertificateAggregate.fromEvents([transferredEvent]);
            };
            expect(apply).toThrow(CertificateErrors.Transfer.CertificateNotIssued);
        });

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
            const aggregate = CertificateAggregate.fromEvents([issuedEvent]);

            const apply = () => {
                aggregate.apply(fromZeroTransferredEvent);
            };
            expect(apply).toThrow(CertificateErrors.Transfer.FromZeroAddress);
        });

        it('should throw error when to account is zero address', () => {
            const aggregate = CertificateAggregate.fromEvents([issuedEvent]);

            const apply = () => {
                aggregate.apply(toZeroTransferredEvent);
            };
            expect(apply).toThrow(CertificateErrors.Transfer.ToZeroAddress);
        });

        it('should throw error when from account has not enough balance', () => {
            const aggregate = CertificateAggregate.fromEvents([issuedEvent]);

            const apply = () => {
                aggregate.apply(tooBigValueransferredEvent);
            };
            expect(apply).toThrow(CertificateErrors.Transfer.NotEnoughBalance);
        });

        it('should transfer all available balance when no energyValue is spiecified', () => {
            const aggregate = CertificateAggregate.fromEvents([issuedEvent]);

            const noValuetransferredEvent = new CertificateTransferredEvent(1, {
                certificateId: 1,
                fromAddress: '0x1',
                toAddress: '0x2'
            });

            aggregate.apply(noValuetransferredEvent);
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
            const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
            const noVolumestransferredEvent = new CertificateTransferredEvent(1, {
                certificateId: 1,
                fromAddress: '0x2',
                toAddress: '0x3'
            });

            const apply = () => {
                aggregate.apply(noVolumestransferredEvent);
            };
            expect(apply).toThrow(CertificateErrors.Transfer.NotEnoughBalance);
        });
    });

    describe('Claim', () => {
        it('should throw error when certificate was not issued beforehand', () => {
            const apply = () => {
                const aggregate = CertificateAggregate.fromEvents([claimedEvent]);
            };
            expect(apply).toThrow(CertificateErrors.Claim.CertificateNotIssued);
        });

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
            const aggregate = CertificateAggregate.fromEvents([issuedEvent]);

            const apply = () => {
                aggregate.apply(forZeroAddressClaimedEvent);
            };
            expect(apply).toThrow(CertificateErrors.Claim.ForZeroAddress);
        });

        it('should throw error when forAccount has not enough balance', () => {
            const aggregate = CertificateAggregate.fromEvents([issuedEvent]);

            const apply = () => {
                aggregate.apply(tooBigValueClaimedEvent);
            };
            expect(apply).toThrow(CertificateErrors.Claim.NotEnoughBalance);
        });

        it('should claim all available balance when no energyValue was specified', () => {
            const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
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
            aggregate.apply(claimedEvent);

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
            const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
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

            const apply = () => {
                aggregate.apply(claimedEvent);
            };
            expect(apply).toThrow(CertificateErrors.Claim.NotEnoughBalance);
        });
    });
});
