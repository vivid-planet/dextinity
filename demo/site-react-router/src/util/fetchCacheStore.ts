import { createMemoryFetchCacheStore, type FetchCacheStore } from "@dextinity/site-react-router/server";

import { createValkeyFetchCacheStore } from "./valkeyFetchCacheStore";

/**
 * Where the responses of the API are cached, the counterpart of the cache handler of the Next.js site (cache-handler.ts).
 * With Valkey, all instances of the site share the cache.
 */
export const fetchCacheStore: FetchCacheStore = process.env.VALKEY_ENABLED === "true" ? createValkeyFetchCacheStore() : createMemoryFetchCacheStore();
