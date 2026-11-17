import { metrics } from "@opentelemetry/api";
import { Redis, type RedisOptions } from "ioredis";
import { LRUCache } from "lru-cache";

export type CachedResponse = {
    status: number;
    headers: Record<string, string>;
    body: string;
};

export type FetchCacheEntry = {
    lastModified: number;
    value: CachedResponse;
};

export type FetchCacheStore = {
    get: (key: string) => Promise<FetchCacheEntry | null>;
    set: (key: string, entry: FetchCacheEntry) => Promise<void>;
};

const defaultTtlInSeconds = 24 * 60 * 60;

// Created on use, instruments created before the project registers the OpenTelemetry SDK would never record anything
function createFetchCacheMetrics() {
    const meter = metrics.getMeter("@dextinity/site-vite-rsc");
    return {
        hitCount: meter.createCounter("fetchcache.get.hit", { description: "Fetch cache hits", unit: "requests" }),
        missCount: meter.createCounter("fetchcache.get.miss", { description: "Fetch cache misses", unit: "requests" }),
        setCount: meter.createCounter("fetchcache.set", { description: "Fetch cache sets", unit: "requests" }),
        fallbackCount: meter.createCounter("fetchcache.get.fallback", { description: "Fetch cache in-memory fallback gets", unit: "requests" }),
        getAge: meter.createHistogram("fetchcache.get.age", { description: "Fetch cache age when retrieved", unit: "s" }),
    };
}

type FetchCacheMetrics = ReturnType<typeof createFetchCacheMetrics>;

function recordGet(fetchCacheMetrics: FetchCacheMetrics, entry: FetchCacheEntry | null) {
    if (entry) {
        fetchCacheMetrics.hitCount.add(1);
        fetchCacheMetrics.getAge.record((Date.now() - entry.lastModified) / 1000);
    } else {
        fetchCacheMetrics.missCount.add(1);
    }
}

/**
 * Keeps the entries in the memory of the process, e.g. for sites without Valkey or as fallback while Valkey is unavailable
 */
export function createMemoryFetchCacheStore({
    maxSizeInBytes = 50 * 1024 * 1024,
    ttlInSeconds = defaultTtlInSeconds,
}: { maxSizeInBytes?: number; ttlInSeconds?: number } = {}): FetchCacheStore {
    const fetchCacheMetrics = createFetchCacheMetrics();
    const cache = new LRUCache<string, FetchCacheEntry>({ maxSize: maxSizeInBytes, ttl: ttlInSeconds * 1000, ttlAutopurge: true });

    return {
        async get(key) {
            const entry = cache.get(key) ?? null;
            recordGet(fetchCacheMetrics, entry);
            return entry;
        },
        async set(key, entry) {
            fetchCacheMetrics.setCount.add(1);
            cache.set(key, entry, { size: JSON.stringify(entry).length });
        },
    };
}

/**
 * Shares the entries between the instances of the site. Uses `fallback` while Valkey is unavailable.
 */
export function createValkeyFetchCacheStore({
    connection,
    ttlInSeconds = defaultTtlInSeconds,
    fallback,
}: {
    /** Passed to ioredis, e.g. `host`, `port`, `password` and `keyPrefix` */
    connection: RedisOptions;
    ttlInSeconds?: number;
    fallback: FetchCacheStore;
}): FetchCacheStore {
    const fetchCacheMetrics = createFetchCacheMetrics();
    // Without the offline queue, commands fail immediately while Valkey is unavailable instead of waiting for it
    const redis = new Redis({ ...connection, enableOfflineQueue: false, enableAutoPipelining: true });
    let isFallbackInUse = false;

    function switchToFallback() {
        if (!isFallbackInUse) {
            console.warn(`${new Date().toISOString()} [${connection.host} down] Switching to the fallback cache`);
            isFallbackInUse = true;
        }
        return fallback;
    }

    return {
        async get(key) {
            if (redis.status === "ready") {
                try {
                    const value = await redis.get(key);
                    if (isFallbackInUse) {
                        isFallbackInUse = false;
                        console.info(`${new Date().toISOString()} [${connection.host} up] Switching back to Valkey`);
                    }
                    const entry = value ? (JSON.parse(value) as FetchCacheEntry) : null;
                    recordGet(fetchCacheMetrics, entry);
                    return entry;
                } catch (error) {
                    console.error("FetchCache.get error", error);
                }
            }
            fetchCacheMetrics.fallbackCount.add(1);
            return switchToFallback().get(key);
        },
        async set(key, entry) {
            if (redis.status !== "ready") {
                await switchToFallback().set(key, entry);
                return;
            }
            fetchCacheMetrics.setCount.add(1);
            try {
                await redis.set(key, JSON.stringify(entry), "EX", ttlInSeconds);
            } catch (error) {
                console.error("FetchCache.set error", error);
            }
        },
    };
}
