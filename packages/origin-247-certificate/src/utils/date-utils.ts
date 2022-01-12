export function compareDates(first: Date, second: Date): number {
    const timeDiff = first.getTime() - second.getTime();
    return timeDiff;
}
