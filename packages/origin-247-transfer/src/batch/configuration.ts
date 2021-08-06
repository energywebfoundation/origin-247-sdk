export interface BatchConfiguration {
    issueAggregateSeconds: number;
    issueBatchSize: number;
    validateAggregateSeconds: number;
    validateBatchSize: number;
    transferAggregateSeconds: number;
    transferBatchSize: number;
}

export const BATCH_CONFIGURATION_TOKEN = Symbol.for('BATCH_CONFIGURATION_TOKEN');

export const defaultBatchConfiguration: BatchConfiguration = {
    issueAggregateSeconds: 10,
    issueBatchSize: 10,
    validateAggregateSeconds: 3,
    validateBatchSize: 25,
    transferAggregateSeconds: 30, // because it can run on greater batches we want to aggregate more
    transferBatchSize: 100
};
