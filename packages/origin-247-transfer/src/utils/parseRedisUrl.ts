import { defaults } from 'lodash';
import { parse as urllibParse } from 'url';

/**
 * We support only REDIS_URL env variable,
 * and we want to use io-redis cache manager,
 * therefore https://github.com/dabroek/node-cache-manager-ioredis/pull/1
 * and https://github.com/luin/ioredis/blob/4680211fe853831f9ff3a3eb69f16d5db6bfbabd/lib/utils/index.ts
 */

function isInt(value): value is string {
    const x = parseFloat(value);
    return !isNaN(value) && (x | 0) === x;
}

export function parseRedisUrl(url) {
    if (isInt(url)) {
        return { port: url };
    }
    let parsed = urllibParse(url, true, true);

    if (!parsed.slashes && url[0] !== '/') {
        url = '//' + url;
        parsed = urllibParse(url, true, true);
    }

    const options = parsed.query || {};
    const allowUsernameInURI = options.allowUsernameInURI && options.allowUsernameInURI !== 'false';
    delete options.allowUsernameInURI;

    const result: any = {};
    if (parsed.auth) {
        const index = parsed.auth.indexOf(':');
        if (allowUsernameInURI) {
            result.username = index === -1 ? parsed.auth : parsed.auth.slice(0, index);
        }
        result.password = index === -1 ? '' : parsed.auth.slice(index + 1);
    }
    if (parsed.pathname) {
        if (parsed.protocol === 'redis:' || parsed.protocol === 'rediss:') {
            if (parsed.pathname.length > 1) {
                result.db = parsed.pathname.slice(1);
            }
        } else {
            result.path = parsed.pathname;
        }
    }
    if (parsed.host) {
        result.host = parsed.hostname;
    }
    if (parsed.port) {
        result.port = parsed.port;
    }
    defaults(result, options);

    return result;
}
