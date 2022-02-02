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
    issueBatchSize: 500,
    validateAggregateSeconds: 10,
    validateBatchSize: 500,
    transferAggregateSeconds: 10,
    transferBatchSize: 200
};
