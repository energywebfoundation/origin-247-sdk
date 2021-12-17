import {
    CertificateClaimedEvent,
    CertificateEventType,
    CertificateIssuedEvent,
    CertificateTransferredEvent
} from '../events/Certificate.events';
import { BlockchainSynchronizeService } from '../synchronize/blockchain-synchronize.service';
import { Test } from '@nestjs/testing';
import { CERTIFICATE_COMMAND_REPOSITORY } from '../repositories/CertificateCommand/CertificateCommand.repository';
import { CERTIFICATE_EVENT_REPOSITORY } from '../repositories/CertificateEvent/CertificateEvent.repository';
import { blockchainQueueName } from '../../blockchain-actions.processor';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { CertificateEventEntity } from '../repositories/CertificateEvent/CertificateEvent.entity';
import { CertificateCommandEntity } from '../repositories/CertificateCommand/CertificateCommand.entity';

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

describe('BlockchainSynchronize', () => {
    let blockchainSynchronizeService: BlockchainSynchronizeService;
    const addToQueueMock = jest.fn();
    const eventRepositoryMock = {
        getAllNotProcessed: jest.fn(),
        markAsSynchronized: jest.fn(),
        getAll: jest.fn(),
        saveProcessingError: jest.fn(),
        save: jest.fn(),
        getByInternalCertificateId: jest.fn(),
        getNumberOfCertificates: jest.fn()
    };

    const commandRepositoryMock = {
        getById: jest.fn()
    };

    beforeEach(async () => {
        const app = await Test.createTestingModule({
            providers: [
                BlockchainSynchronizeService,
                {
                    provide: CERTIFICATE_COMMAND_REPOSITORY,
                    useValue: commandRepositoryMock
                },
                {
                    provide: CERTIFICATE_EVENT_REPOSITORY,
                    useValue: eventRepositoryMock
                },
                {
                    provide: getQueueToken(blockchainQueueName),
                    useValue: {
                        add: addToQueueMock
                    } as Partial<Queue>
                }
            ]
        }).compile();

        blockchainSynchronizeService = app.get(BlockchainSynchronizeService);
    });

    describe('synchronize', () => {
        it('work for no new events', async () => {
            eventRepositoryMock.getAllNotProcessed.mockResolvedValueOnce([]);

            await blockchainSynchronizeService.synchronize();

            expect(eventRepositoryMock.getAllNotProcessed).toBeCalledTimes(1);
        });

        it('work for new issuance event', async () => {
            const eventStub = {
                id: 0,
                type: CertificateEventType.Issued,
                commandId: 1,
                payload: {}
            } as CertificateEventEntity;
            const commandStub = {
                payload: {},
                id: 1
            } as CertificateCommandEntity;
            eventRepositoryMock.getAllNotProcessed.mockResolvedValueOnce([eventStub]);
            commandRepositoryMock.getById.mockResolvedValueOnce(commandStub);

            await blockchainSynchronizeService.synchronize();

            expect(eventRepositoryMock.getAllNotProcessed).toBeCalledTimes(1);
            expect(commandRepositoryMock.getById).toBeCalledTimes(1);
            expect(commandRepositoryMock.getById).toBeCalledWith(eventStub.commandId);
            expect(eventRepositoryMock.markAsSynchronized).toBeCalledWith(eventStub.id);
        });
    });
    //
    // describe('Issue', () => {
    //     it('should throw an error when certificate is issued twice', () => {
    //         const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
    //         const apply = () => {
    //             aggregate.apply(issuedEvent);
    //         };
    //         expect(apply).toThrow(CertificateErrors.Issuance.CertificateAlreadyIssued);
    //     });
    //
    //     it('should issue a certificate', () => {
    //         const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
    //         expect(aggregate.getCertificate()).toMatchObject({
    //             internalCertificateId: 1,
    //             blockchainCertificateId: null,
    //             claims: [],
    //             creationBlockHash: '',
    //             deviceId: 'firstDevice',
    //             generationStartTime: 1637278544811,
    //             generationEndTime: 1637278545811,
    //             metadata: {},
    //             owners: { '0x1': '100' },
    //             claimers: {}
    //         });
    //     });
    // });
    //
    // describe('Transfer', () => {
    //     it('should throw error when certificate was not issued beforehand', () => {
    //         const apply = () => {
    //             const aggregate = CertificateAggregate.fromEvents([transferredEvent]);
    //         };
    //         expect(apply).toThrow(CertificateErrors.Transfer.CertificateNotIssued);
    //     });
    //
    //     it('should apply transfer when from account has enough balance', () => {
    //         const aggregate = CertificateAggregate.fromEvents([issuedEvent, transferredEvent]);
    //
    //         expect(aggregate.getCertificate()).toMatchObject({
    //             internalCertificateId: 1,
    //             blockchainCertificateId: null,
    //             claims: [],
    //             creationBlockHash: '',
    //             deviceId: 'firstDevice',
    //             generationStartTime: 1637278544811,
    //             generationEndTime: 1637278545811,
    //             metadata: {},
    //             owners: {
    //                 '0x1': '0',
    //                 '0x2': '100'
    //             },
    //             claimers: {}
    //         });
    //     });
    //
    //     it('should throw error when from account is zero address', () => {
    //         const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
    //
    //         const apply = () => {
    //             aggregate.apply(fromZeroTransferredEvent);
    //         };
    //         expect(apply).toThrow(CertificateErrors.Transfer.FromZeroAddress);
    //     });
    //
    //     it('should throw error when to account is zero address', () => {
    //         const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
    //
    //         const apply = () => {
    //             aggregate.apply(toZeroTransferredEvent);
    //         };
    //         expect(apply).toThrow(CertificateErrors.Transfer.ToZeroAddress);
    //     });
    //
    //     it('should throw error when from account has not enough balance', () => {
    //         const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
    //
    //         const apply = () => {
    //             aggregate.apply(tooBigValueransferredEvent);
    //         };
    //         expect(apply).toThrow(CertificateErrors.Transfer.NotEnoughBalance);
    //     });
    //
    //     it('should transfer all available balance when no energyValue is spiecified', () => {
    //         const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
    //
    //         const noValuetransferredEvent = new CertificateTransferredEvent(1, {
    //             certificateId: 1,
    //             fromAddress: '0x1',
    //             toAddress: '0x2'
    //         });
    //
    //         aggregate.apply(noValuetransferredEvent);
    //         expect(aggregate.getCertificate()).toMatchObject({
    //             internalCertificateId: 1,
    //             blockchainCertificateId: null,
    //             claims: [],
    //             creationBlockHash: '',
    //             deviceId: 'firstDevice',
    //             generationStartTime: 1637278544811,
    //             generationEndTime: 1637278545811,
    //             metadata: {},
    //             owners: {
    //                 '0x1': '0',
    //                 '0x2': '100'
    //             },
    //             claimers: {}
    //         });
    //     });
    //
    //     it('it should throw error when there is no energyValue and no owned volume', () => {
    //         const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
    //         const noVolumestransferredEvent = new CertificateTransferredEvent(1, {
    //             certificateId: 1,
    //             fromAddress: '0x2',
    //             toAddress: '0x3'
    //         });
    //
    //         const apply = () => {
    //             aggregate.apply(noVolumestransferredEvent);
    //         };
    //         expect(apply).toThrow(CertificateErrors.Transfer.NotEnoughBalance);
    //     });
    // });
    //
    // describe('Claim', () => {
    //     it('should throw error when certificate was not issued beforehand', () => {
    //         const apply = () => {
    //             const aggregate = CertificateAggregate.fromEvents([claimedEvent]);
    //         };
    //         expect(apply).toThrow(CertificateErrors.Claim.CertificateNotIssued);
    //     });
    //
    //     it('should apply claim when for account has enough balance', () => {
    //         const aggregate = CertificateAggregate.fromEvents([issuedEvent, claimedEvent]);
    //
    //         expect(aggregate.getCertificate()).toMatchObject({
    //             internalCertificateId: 1,
    //             blockchainCertificateId: null,
    //             claims: [
    //                 {
    //                     from: '0x1',
    //                     to: '0x1',
    //                     topic: '',
    //                     value: '100',
    //                     claimData: {
    //                         beneficiary: 'someBeneficiary',
    //                         location: 'Radom',
    //                         countryCode: 'PL',
    //                         periodStartDate: '2021-11-18T08:00:00.000Z',
    //                         periodEndDate: '2021-11-18T08:30:00.000Z',
    //                         purpose: 'higher'
    //                     }
    //                 }
    //             ],
    //             creationBlockHash: '',
    //             deviceId: 'firstDevice',
    //             generationStartTime: 1637278544811,
    //             generationEndTime: 1637278545811,
    //             metadata: {},
    //             owners: {
    //                 '0x1': '0'
    //             },
    //             claimers: {
    //                 '0x1': '100'
    //             }
    //         });
    //     });
    //
    //     it('should throw error when forAccount is zero address', () => {
    //         const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
    //
    //         const apply = () => {
    //             aggregate.apply(forZeroAddressClaimedEvent);
    //         };
    //         expect(apply).toThrow(CertificateErrors.Claim.ForZeroAddress);
    //     });
    //
    //     it('should throw error when forAccount has not enough balance', () => {
    //         const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
    //
    //         const apply = () => {
    //             aggregate.apply(tooBigValueClaimedEvent);
    //         };
    //         expect(apply).toThrow(CertificateErrors.Claim.NotEnoughBalance);
    //     });
    //
    //     it('should claim all available balance when no energyValue was specified', () => {
    //         const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
    //         const claimedEvent = new CertificateClaimedEvent(1, {
    //             certificateId: 1,
    //             claimData: {
    //                 beneficiary: 'someBeneficiary',
    //                 location: 'Radom',
    //                 countryCode: 'PL',
    //                 periodStartDate: '2021-11-18T08:00:00.000Z',
    //                 periodEndDate: '2021-11-18T08:30:00.000Z',
    //                 purpose: 'higher'
    //             },
    //             forAddress: '0x1'
    //         });
    //         aggregate.apply(claimedEvent);
    //
    //         expect(aggregate.getCertificate()).toMatchObject({
    //             internalCertificateId: 1,
    //             blockchainCertificateId: null,
    //             claims: [
    //                 {
    //                     from: '0x1',
    //                     to: '0x1',
    //                     topic: '',
    //                     value: '100',
    //                     claimData: {
    //                         beneficiary: 'someBeneficiary',
    //                         location: 'Radom',
    //                         countryCode: 'PL',
    //                         periodStartDate: '2021-11-18T08:00:00.000Z',
    //                         periodEndDate: '2021-11-18T08:30:00.000Z',
    //                         purpose: 'higher'
    //                     }
    //                 }
    //             ],
    //             creationBlockHash: '',
    //             deviceId: 'firstDevice',
    //             generationStartTime: 1637278544811,
    //             generationEndTime: 1637278545811,
    //             metadata: {},
    //             owners: {
    //                 '0x1': '0'
    //             },
    //             claimers: {
    //                 '0x1': '100'
    //             }
    //         });
    //     });
    //
    //     it('it should throw error when there is no energyValue and no owned volume', () => {
    //         const aggregate = CertificateAggregate.fromEvents([issuedEvent]);
    //         const claimedEvent = new CertificateClaimedEvent(1, {
    //             certificateId: 1,
    //             claimData: {
    //                 beneficiary: 'someBeneficiary',
    //                 location: 'Radom',
    //                 countryCode: 'PL',
    //                 periodStartDate: '2021-11-18T08:00:00.000Z',
    //                 periodEndDate: '2021-11-18T08:30:00.000Z',
    //                 purpose: 'higher'
    //             },
    //             forAddress: '0x2'
    //         });
    //
    //         const apply = () => {
    //             aggregate.apply(claimedEvent);
    //         };
    //         expect(apply).toThrow(CertificateErrors.Claim.NotEnoughBalance);
    //     });
    // });
});
