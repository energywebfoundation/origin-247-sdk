import { DateTime, Duration as luxDuration, DurationObject } from 'luxon';

/**
 * Treats month as 30 days
 * Treats year as 365 days
 */
export class Duration {
    private durationValue: number;
    private durationUnit: string;
    private duration: string;
    /**
     * @param duration - <int><unit> e.g. 30m, m = minute, h=hours, d=days
     */
    constructor(duration: string) {
        const match = duration.match(Duration.durationRegex);

        if (!match) {
            throw new InvalidDurationSyntax(duration);
        }

        const unit = match.groups!.unit;
        const value = Number(match.groups!.value);

        // only supporting single month/year because of duration variability issues
        if ((unit === 'mo' || unit === 'y') && value !== 1) {
            throw new InvalidDurationValue(duration);
        }

        this.duration = duration;
        this.durationValue = value;
        this.durationUnit = unit;
    }

    public toDurationString(): string {
        const unit = this.durationUnit.toUpperCase();
        const value = this.durationValue;
        return unit === 'M' || unit === 'H' ? `PT${value}${unit}` : `P${value}${unit[0]}`;
    }

    // This will return incorrect values for month and year
    private getMilliSeconds(): number {
        const duration = luxDuration.fromISO(this.toDurationString());
        return duration.toMillis();
    }

    public toLuxonDuration(): DurationObject {
        return luxDuration.fromISO(this.toDurationString()).toObject();
    }

    public roundDate(dateToRound: Date): number {
        switch (this.durationUnit) {
            case 'mo':
                return DateTime.fromJSDate(dateToRound).startOf('month').toMillis();
            case 'y':
                return DateTime.fromJSDate(dateToRound).startOf('year').toMillis();
            default:
                return this.roundToClosestLower(dateToRound);
        }
    }

    public static readonly durationValidationRegex = /(^(\d+)(m|h|d|w)$)|(^(1)(mo|y)$)/;
    private static readonly durationRegex = /^(?<value>\d+)(?<unit>m|h|d|w|mo|y)$/;

    private roundToClosestLower(dateToRound: Date): number {
        const toClosest = this.getMilliSeconds();
        return Math.floor(dateToRound.getTime() / toClosest) * toClosest;
    }
}

export class InvalidDurationSyntax extends Error {
    constructor(duration: string) {
        super(`Invalid duration syntax: ${duration}.`);
    }
}

export class InvalidDurationValue extends Error {
    constructor(duration: string) {
        super(
            `Invalid duration value: ${duration}. Monthly or yearly durations can only have value of 1.`
        );
    }
}
