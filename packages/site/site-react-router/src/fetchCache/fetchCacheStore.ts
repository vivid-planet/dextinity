import { LRUCache } from "lru-cache";

export type CachedResponse = {
    status: number;
    statusText: string;
    headers: Array<[string, string]>;
    body: string;
};

export type FetchCacheEntry = {
    response: CachedResponse;
    /** When the response was fetched, in milliseconds since the epoch */
    createdAt: number;
};

/**
 * Where `createCachingFetch()` stores the responses, the counterpart of the cache handler of Next.js.
 * Stores must keep entries longer than the revalidation time, so that stale entries can be served while they are refreshed.
 */
export interface FetchCacheStore {
    get(key: string): Promise<FetchCacheEntry | undefined>;
    set(key: string, entry: FetchCacheEntry): Promise<void>;
}

/**
 * An in-memory store of the responses, limited by their size
 */
export function createMemoryFetchCacheStore({ maxSizeInBytes = 50 * 1024 * 1024, ttlInSeconds = 24 * 60 * 60 } = {}): FetchCacheStore {
    const cache = new LRUCache<string, FetchCacheEntry>({
        maxSize: maxSizeInBytes,
        sizeCalculation: (entry) => Math.max(entry.response.body.length, 1),
        ttl: ttlInSeconds * 1000,
        ttlAutopurge: true,
    });
    return {
        async get(key) {
            return cache.get(key);
        },
        async set(key, entry) {
            cache.set(key, entry);
        },
    };
}
