// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMemoryFetchCacheStore, createValkeyFetchCacheStore, type FetchCacheEntry } from "./fetchCacheStore.js";

function createEntry(body: string): FetchCacheEntry {
    return { lastModified: Date.now(), value: { status: 200, headers: { "content-type": "application/json" }, body } };
}

describe("createMemoryFetchCacheStore", () => {
    it("returns the stored entries", async () => {
        const store = createMemoryFetchCacheStore();
        const entry = createEntry('{"data":{}}');

        await store.set("key", entry);

        expect(await store.get("key")).toEqual(entry);
        expect(await store.get("unknown")).toBeNull();
    });

    it("evicts the least recently used entries when the maximum size is reached", async () => {
        const entrySize = JSON.stringify(createEntry("a".repeat(100))).length;
        const store = createMemoryFetchCacheStore({ maxSizeInBytes: entrySize * 2 });

        await store.set("first", createEntry("a".repeat(100)));
        await store.set("second", createEntry("b".repeat(100)));
        await store.set("third", createEntry("c".repeat(100)));

        expect(await store.get("first")).toBeNull();
        expect(await store.get("second")).not.toBeNull();
        expect(await store.get("third")).not.toBeNull();
    });
});

describe("createValkeyFetchCacheStore", () => {
    beforeEach(() => {
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("uses the fallback while Valkey isn't connected", async () => {
        const fallback = createMemoryFetchCacheStore();
        // lazyConnect keeps the client disconnected, as the store doesn't send commands before Valkey is ready
        const store = createValkeyFetchCacheStore({ connection: { host: "valkey.invalid", lazyConnect: true }, fallback });
        const entry = createEntry('{"data":{}}');

        await store.set("key", entry);

        expect(await store.get("key")).toEqual(entry);
        expect(await fallback.get("key")).toEqual(entry);
        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("[valkey.invalid down] Switching to the fallback cache"));
    });
});
