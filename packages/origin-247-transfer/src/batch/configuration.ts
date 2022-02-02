export interface BatchConfiguration {
    issueAggregateSeconds: number;
    issueBatchSize: number;
    validateAggregateSeconds: number;
    validateBatchSize: number;
    transferAggregateSeconds: number;
    transferBatchSize: number;
}

export const BATCH_CONFIGURATION_TOKEN = Symbol.for('BATCH_CONFIGURATION_TOKEN');

const issueBatchSize = 500;

export const defaultBatchConfiguration: BatchConfiguration = {
    issueAggregateSeconds: 10,
    issueBatchSize: issueBatchSize,
    validateAggregateSeconds: 10,
    validateBatchSize: 500,
    transferAggregateSeconds: 10,
    // Transfer for the same batch size takes approximately 2.5x longer than issuance
    transferBatchSize: issueBatchSize / 2.5
};
