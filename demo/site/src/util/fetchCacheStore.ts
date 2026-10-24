/* eslint-disable no-console */
import { getOrCreateCounter, getOrCreateHistogram } from "@src/../opentelemetry-metrics";
import { Redis } from "ioredis";
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

const CACHE_TTL_IN_S = 24 * 60 * 60; // 1 day

const CACHE_HANDLER_DEBUG = process.env.CACHE_HANDLER_DEBUG === "true";

const fallbackCache = new LRUCache<string, FetchCacheEntry>({
    maxSize: 50 * 1024 * 1024, // 50MB
    ttl: CACHE_TTL_IN_S * 1000,
    ttlAutopurge: true,
});

const cacheHitCount = getOrCreateCounter("fetchcache.get.hit", {
    description: "Fetch cache hits",
    unit: "requests",
});
const cacheMissCount = getOrCreateCounter("fetchcache.get.miss", {
    description: "Fetch cache misses",
    unit: "requests",
});
const cacheSetCount = getOrCreateCounter("fetchcache.set", {
    description: "Fetch cache sets",
    unit: "requests",
});
const cacheFallbackCount = getOrCreateCounter("fetchcache.get.fallback", {
    description: "Fetch cache in-memory fallback gets",
    unit: "requests",
});
const cacheGetAge = getOrCreateHistogram("fetchcache.get.age", {
    description: "Fetch cache age when retrieved",
    unit: "s",
});

function createRedis() {
    const VALKEY_HOST = process.env.VALKEY_HOST;
    if (!VALKEY_HOST) {
        throw new Error("VALKEY_HOST is required");
    }

    const VALKEY_PASSWORD = process.env.VALKEY_PASSWORD;
    if (!VALKEY_PASSWORD) {
        throw new Error("VALKEY_PASSWORD is required");
    }

    return new Redis({
        enableOfflineQueue: false,
        host: VALKEY_HOST,
        keyPrefix: process.env.VALKEY_KEY_PREFIX || "",
        password: VALKEY_PASSWORD,
        port: parseInt(process.env.VALKEY_PORT || "6379", 10),
        enableAutoPipelining: true,
    });
}

// Without Valkey, the in-memory cache is used exclusively
const redis = process.env.VALKEY_ENABLED === "true" ? createRedis() : undefined;

let isFallbackInUse = false;

export async function getFetchCacheEntry(key: string): Promise<FetchCacheEntry | null> {
    if (redis?.status === "ready") {
        try {
            if (CACHE_HANDLER_DEBUG) {
                console.log("FetchCache.get redis", key);
            }

            const redisResponse = await redis.get(key);
            if (isFallbackInUse) {
                isFallbackInUse = false;
                console.info(`${new Date().toISOString()} [${process.env.VALKEY_HOST} up] Switching back to redis cache`);
            }
            if (!redisResponse) {
                cacheMissCount.add(1);
                return null;
            }
            cacheHitCount.add(1);
            const entry = JSON.parse(redisResponse) as FetchCacheEntry;
            cacheGetAge.record((Date.now() - entry.lastModified) / 1000);
            return entry;
        } catch (e) {
            console.error("FetchCache.get error", e);
        }
    }

    if (CACHE_HANDLER_DEBUG) {
        console.log("FetchCache.get fallbackCache", key);
    }

    if (redis) {
        if (!isFallbackInUse) {
            console.warn(`${new Date().toISOString()} | [${process.env.VALKEY_HOST} down] switching to fallback in-memory cache`);
            isFallbackInUse = true;
        }
        cacheFallbackCount.add(1);
    }

    const entry = fallbackCache.get(key) ?? null;
    if (entry) {
        cacheHitCount.add(1);
    } else {
        cacheMissCount.add(1);
    }
    return entry;
}

export async function setFetchCacheEntry(key: string, value: CachedResponse): Promise<void> {
    cacheSetCount.add(1);

    const entry: FetchCacheEntry = {
        lastModified: Date.now(),
        value,
    };
    const stringData = JSON.stringify(entry);

    if (redis?.status === "ready") {
        try {
            if (CACHE_HANDLER_DEBUG) {
                console.log("FetchCache.set redis", key);
            }
            await redis.set(key, stringData, "EX", CACHE_TTL_IN_S);
        } catch (e) {
            console.error("FetchCache.set error", e);
        }
        return;
    }
    if (CACHE_HANDLER_DEBUG) {
        console.log("FetchCache.set fallbackCache", key);
    }
    fallbackCache.set(key, entry, { size: stringData.length });
}
