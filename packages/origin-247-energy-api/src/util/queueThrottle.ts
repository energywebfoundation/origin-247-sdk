import { Subject, throttleTime, asyncScheduler, concatMap, from, tap, startWith } from 'rxjs';
import { debounce } from 'lodash';

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
export const queueThrottle = (cb: () => Promise<unknown>, throttleSeconds: number) => {
    const subject = new Subject();

    // throttling part
    const debounced = debounce(() => subject.next(null), throttleSeconds * 1000, {
        maxWait: throttleSeconds * 1000
    });

    const sub = subject
        .pipe(
            // Queueing part
            concatMap(() => from(cb()))
        )
        .subscribe();

    return {
        trigger: () => debounced(),
        unsubscribe: () => sub.unsubscribe()
    };
};
