import { describe, expect, it, vi } from "vitest";

import { MailImageFetchError } from "../mail-image";
import { MailImageCache } from "../mail-image-cache";

function createImage(byteLength: number) {
    return { buffer: Buffer.alloc(byteLength), filename: "image.png", contentType: "image/png" };
}

describe("MailImageCache", () => {
    it("fetches an image once for requests at the same time and later ones", async () => {
        const cache = new MailImageCache();
        const fetchImage = vi.fn().mockResolvedValue(createImage(10));

        await Promise.all([cache.fetch("key", fetchImage), cache.fetch("key", fetchImage)]);
        await cache.fetch("key", fetchImage);

        expect(fetchImage).toHaveBeenCalledTimes(1);
        expect({ hits: cache.hits, misses: cache.misses }).toEqual({ hits: 2, misses: 1 });
    });

    it("keeps an image that came up empty", async () => {
        const cache = new MailImageCache();
        const fetchImage = vi.fn().mockResolvedValue(null);

        await cache.fetch("key", fetchImage);
        await cache.fetch("key", fetchImage);

        expect(fetchImage).toHaveBeenCalledTimes(1);
    });

    it("fetches again after a failed fetch", async () => {
        const cache = new MailImageCache();
        const fetchImage = vi.fn().mockRejectedValueOnce(new MailImageFetchError("image", "timeout")).mockResolvedValue(createImage(10));

        await expect(cache.fetch("key", fetchImage)).rejects.toThrow(MailImageFetchError);
        await expect(cache.fetch("key", fetchImage)).resolves.toMatchObject({ filename: "image.png" });

        expect(fetchImage).toHaveBeenCalledTimes(2);
    });

    it("returns an image over the budget without keeping it, and reports the exceeded budget once", async () => {
        const onBudgetExceeded = vi.fn();
        const cache = new MailImageCache({ maxBytes: 15, onBudgetExceeded });
        const fetchImage = vi.fn().mockImplementation(async () => createImage(10));

        await cache.fetch("first", fetchImage);
        await expect(cache.fetch("second", fetchImage)).resolves.toMatchObject({ filename: "image.png" });
        await cache.fetch("second", fetchImage);
        await cache.fetch("first", fetchImage);

        expect(fetchImage).toHaveBeenCalledTimes(3);
        expect(onBudgetExceeded).toHaveBeenCalledTimes(1);
        expect(onBudgetExceeded).toHaveBeenCalledWith({ maxBytes: 15, cachedBytes: 10, cachedImages: 1, rejectedBytes: 10 });
    });
});
