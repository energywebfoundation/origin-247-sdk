export function compareDates(first: Date, second: Date): number {
    const timeDiff = first.getTime() - second.getTime();
    if (timeDiff === 0) {
        return first.getMilliseconds() - second.getMilliseconds();
    }
    return timeDiff;
}
