import { MigrationInterface, QueryRunner } from 'typeorm';
import { groupBy } from 'lodash';

export class AddIsSyncedToReadModel1641991678453 implements MigrationInterface {
    name = 'AddIsSyncedToReadModel1641991678453';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "certificate_read_model" ADD "isSynced" boolean`);
        await this.setSyncStatus(queryRunner);
        await queryRunner.query(
            `ALTER TABLE "certificate_read_model" ALTER COLUMN  "isSynced" SET NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "certificate_read_model" DROP COLUMN "isSynced"`);
    }

    private async setSyncStatus(queryRunner: QueryRunner): Promise<void> {
        const events = await queryRunner.query(`SELECT * FROM certificate_event`);

        const eventsByCertificate = groupBy(events, 'internalCertificateId');

        for (const [internalCertificateId, events] of Object.entries(eventsByCertificate)) {
            const isSynced = this.reduceIsSynced(events);

            await queryRunner.query(
                `UPDATE "certificate_read_model" SET "isSynced" = $1 WHERE "internalCertificateId" = $2`,
                [isSynced, internalCertificateId]
            );
        }
    }

    private reduceIsSynced(events: any[]): boolean {
        const toPersistCounter = events.reduce((toPersistCounter, event) => {
            switch (event.type) {
                case 'Issued':
                case 'Transferred':
                case 'Claimed':
                    return toPersistCounter + 1;
                case 'ClaimPersisted':
                case 'IssuancePersisted':
                case 'TransferPersisted':
                    return toPersistCounter - 1;
                case 'PersistError':
                    return toPersistCounter;
                default:
                    toPersistCounter;
            }
        }, 0);

        if (toPersistCounter > 0) {
            return false;
        } else if (toPersistCounter === 0) {
            return true;
        } else {
            throw new Error(
                `Too many persisted events for certificate ${events[0].internalCertificateId}`
            );
        }
    }
}
