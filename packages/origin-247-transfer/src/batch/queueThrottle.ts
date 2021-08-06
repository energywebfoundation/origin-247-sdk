import { Subject, throttleTime, asyncScheduler, concatMap, from, tap, startWith } from 'rxjs';

/**
 * Ignore all calls for @time, then proceed (and repeat) - at least one call will happen after @time.
 *
 * It also queues promises (so they don't run in parallel) - if multiple calls arrive
 * despite throttling, they will be executed one by one.
 *
 * It also makes initial call automatically.
 *
 * @param cb - callback that should return Promise
 * @param throttleSeconds - throttling time in seconds
 * @returns - function to call to "add to queue"
 */
export const queueThrottle = <T>(cb: () => Promise<unknown>, throttleSeconds: number) => {
    const subject = new Subject<T>();

    subject
        .pipe(
            // Initializing part
            startWith(true),
            // Ignoring part
            // This will also ensure, that batch size is at least of @throttleSeconds large
            throttleTime(throttleSeconds * 1000, asyncScheduler, {
                leading: false,
                trailing: true
            }),
            // Queueing part
            concatMap(() => from(cb()))
        )
        .subscribe();

    return (value: T) => subject.next(value);
};
