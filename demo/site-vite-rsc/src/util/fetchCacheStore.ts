import { createMemoryFetchCacheStore, createValkeyFetchCacheStore, type FetchCacheStore } from "@dextinity/site-vite-rsc/server";

export function createFetchCacheStore(): FetchCacheStore {
    const memoryStore = createMemoryFetchCacheStore();
    // Without Valkey, the in-memory cache is used exclusively
    if (process.env.VALKEY_ENABLED !== "true") {
        return memoryStore;
    }

    const host = process.env.VALKEY_HOST;
    if (!host) {
        throw new Error("VALKEY_HOST is required");
    }
    const password = process.env.VALKEY_PASSWORD;
    if (!password) {
        throw new Error("VALKEY_PASSWORD is required");
    }

    return createValkeyFetchCacheStore({
        connection: { host, password, port: parseInt(process.env.VALKEY_PORT || "6379", 10), keyPrefix: process.env.VALKEY_KEY_PREFIX || "" },
        fallback: memoryStore,
    });
}
