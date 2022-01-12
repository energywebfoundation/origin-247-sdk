export interface BatchConfiguration {
    issueBatchSize: number;
    claimBatchSize: number;
    transferBatchSize: number;
}

export const BATCH_CONFIGURATION_TOKEN = Symbol.for('BATCH_CONFIGURATION_TOKEN');

export const batchConfiguration: BatchConfiguration = {
    issueBatchSize: 10,
    claimBatchSize: 25 /** @NOTE this may be further optimized probably */,
    transferBatchSize: 100
};