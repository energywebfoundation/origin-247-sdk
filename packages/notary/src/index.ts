import { Notary } from './typechain/Notary';
import { getEventsFromContract } from './util';

export const getAllMeterReadings = async (notaryContract: Notary) =>
    getEventsFromContract(notaryContract, notaryContract.filters.NewMeterReading(null, null));
