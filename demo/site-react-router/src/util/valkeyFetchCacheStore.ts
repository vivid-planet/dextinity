import { createMemoryFetchCacheStore, type FetchCacheEntry, type FetchCacheStore } from "@dextinity/site-react-router/server";
import { getOrCreateCounter, getOrCreateHistogram } from "@src/../opentelemetry-metrics";
import { Redis } from "ioredis";

const cacheTtlInSeconds = 24 * 60 * 60; // 1 day

/**
 * Stores the responses of the API in Valkey, with an in-memory fallback while Valkey isn't available
 */
export function createValkeyFetchCacheStore(): FetchCacheStore {
    const valkeyHost = process.env.VALKEY_HOST;
    if (!valkeyHost) {
        throw new Error("VALKEY_HOST is required");
    }
    const valkeyPassword = process.env.VALKEY_PASSWORD;
    if (!valkeyPassword) {
        throw new Error("VALKEY_PASSWORD is required");
    }

    const redis = new Redis({
        enableOfflineQueue: false,
        host: valkeyHost,
        keyPrefix: process.env.VALKEY_KEY_PREFIX || "",
        password: valkeyPassword,
        port: parseInt(process.env.VALKEY_PORT || "6379", 10),
        enableAutoPipelining: true,
    });
    const fallbackStore = createMemoryFetchCacheStore({ ttlInSeconds: cacheTtlInSeconds });
    let isFallbackInUse = false;

    const cacheHitCount = getOrCreateCounter("fetchcache.get.hit", { description: "Fetch cache hits", unit: "requests" });
    const cacheMissCount = getOrCreateCounter("fetchcache.get.miss", { description: "Fetch cache misses", unit: "requests" });
    const cacheSetCount = getOrCreateCounter("fetchcache.set", { description: "Fetch cache sets", unit: "requests" });
    const cacheFallbackCount = getOrCreateCounter("fetchcache.get.fallback", {
        description: "Fetch cache in-memory fallback gets",
        unit: "requests",
    });
    const cacheGetAge = getOrCreateHistogram("fetchcache.get.age", { description: "Fetch cache age when retrieved", unit: "s" });

    function switchToFallback() {
        if (!isFallbackInUse) {
            console.warn(`${new Date().toISOString()} | [${valkeyHost} down] switching to fallback in-memory cache`);
            isFallbackInUse = true;
        }
    }

    function recordGet(entry: FetchCacheEntry | undefined) {
        if (entry) {
            cacheHitCount.add(1);
            cacheGetAge.record((Date.now() - entry.createdAt) / 1000);
        } else {
            cacheMissCount.add(1);
        }
        return entry;
    }

    return {
        async get(key) {
            if (redis.status === "ready") {
                try {
                    const value = await redis.get(key);
                    if (isFallbackInUse) {
                        isFallbackInUse = false;
                        console.info(`${new Date().toISOString()} [${valkeyHost} up] Switching back to redis cache`);
                    }
                    return recordGet(value ? (JSON.parse(value) as FetchCacheEntry) : undefined);
                } catch (error) {
                    console.error("Fetch cache get error", error);
                }
            }
            switchToFallback();
            cacheFallbackCount.add(1);
            return recordGet(await fallbackStore.get(key));
        },
        async set(key, entry) {
            cacheSetCount.add(1);
            if (redis.status === "ready") {
                try {
                    await redis.set(key, JSON.stringify(entry), "EX", cacheTtlInSeconds);
                    return;
                } catch (error) {
                    console.error("Fetch cache set error", error);
                }
            }
            await fallbackStore.set(key, entry);
        },
    };
}
