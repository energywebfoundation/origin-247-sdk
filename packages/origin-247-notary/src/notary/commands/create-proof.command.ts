export class CreateProofCommand {
    constructor(
        public readonly deviceId: string,
        public readonly readings: {
            timestamp: Date;
            value: number;
        }[]
    ) {}
}
