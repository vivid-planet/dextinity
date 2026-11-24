import { describe, expect, it, vi } from "vitest";

import { type MailImage, MailImageFetchError } from "../mail-image";
import { MailImageCache } from "../mail-image-cache";
import { MailImageCollector, type MailImageSource } from "../mail-image-collector";
import { defaultMailImageLimits, type MailImageLimits } from "../mail-images.config";

const baseUrl = "http://api.example.com";
const damImageUrl = (id: string, width = 640) => `${baseUrl}/dam/images/hash/contenthash/${id}/crop:SMART/resize:${width}:320/photo`;

function createImage(byteLength = 3): MailImage {
    return { buffer: Buffer.alloc(byteLength, 1), filename: "photo.png", contentType: "image/png" };
}

function createCollector({
    fetchImage = vi.fn(async (_source: MailImageSource) => createImage()),
    limits = {},
    hasStaticFiles = true,
    cache,
}: {
    fetchImage?: (source: MailImageSource) => Promise<MailImage | null>;
    limits?: Partial<MailImageLimits>;
    hasStaticFiles?: boolean;
    cache?: MailImageCache;
} = {}) {
    return new MailImageCollector({
        baseUrl,
        damImagesPath: "/dam/images/",
        hasStaticFiles,
        limits: { ...defaultMailImageLimits, ...limits },
        fetchImage,
        cache,
    });
}

describe("MailImageCollector.rewriteImageSrc", () => {
    it("hands out the same cid for the same src", () => {
        const collector = createCollector();

        const first = collector.rewriteImageSrc({ src: damImageUrl("a") });
        const second = collector.rewriteImageSrc({ src: damImageUrl("a") });

        expect(first).toMatch(/^cid:/);
        expect(second).toBe(first);
    });

    it("attaches a DAM image URL and a relative path, and leaves other URLs unchanged", async () => {
        const fetchImage = vi.fn(async (_source: MailImageSource) => createImage());
        const collector = createCollector({ fetchImage });

        collector.rewriteImageSrc({ src: damImageUrl("a") });
        collector.rewriteImageSrc({ src: "mail/logo.png" });
        expect(collector.rewriteImageSrc({ src: "https://cdn.example.com/logo.png" })).toBe("https://cdn.example.com/logo.png");
        expect(collector.rewriteImageSrc({ src: "/logo.png" })).toBe("/logo.png");
        await collector.buildAttachments();

        expect(fetchImage.mock.calls.map(([source]) => source)).toEqual([
            { type: "dam", path: "/dam/images/hash/contenthash/a/crop:SMART/resize:640:320/photo" },
            { type: "static", path: "mail/logo.png" },
        ]);
    });

    it("leaves a relative path unchanged without a static files directory", () => {
        const collector = createCollector({ hasStaticFiles: false });

        expect(collector.rewriteImageSrc({ src: "mail/logo.png" })).toBe("mail/logo.png");
    });
});

describe("MailImageCollector.buildAttachments", () => {
    it("builds an inline attachment with the base64 content for each image", async () => {
        const collector = createCollector();
        const cid = collector.rewriteImageSrc({ src: damImageUrl("a") });

        const attachments = await collector.buildAttachments();

        expect(attachments).toEqual([
            {
                filename: "photo.png",
                content: Buffer.alloc(3, 1).toString("base64"),
                encoding: "base64",
                cid: cid.slice("cid:".length),
                contentDisposition: "inline",
                contentType: "image/png",
            },
        ]);
        expect(collector.hasUnfetchedImages).toBe(false);
    });

    it("leaves out the images after maxImagesPerMail", async () => {
        const collector = createCollector({ limits: { maxImagesPerMail: 1 } });
        collector.rewriteImageSrc({ src: damImageUrl("a") });
        collector.rewriteImageSrc({ src: damImageUrl("b") });

        const attachments = await collector.buildAttachments();

        expect(attachments).toHaveLength(1);
        expect(collector.hasUnfetchedImages).toBe(true);
    });

    it("skips an image that doesn't fit into maxTotalBytesPerMail and keeps the smaller ones after it", async () => {
        const sizes: Record<string, number> = { a: 6, b: 8, c: 4 };
        const fetchImage = vi.fn(async (source: MailImageSource) => createImage(sizes[source.path.split("/")[5]]));
        const collector = createCollector({ fetchImage, limits: { maxTotalBytesPerMail: 10, fetchConcurrency: 1 } });
        for (const id of ["a", "b", "c"]) {
            collector.rewriteImageSrc({ src: damImageUrl(id) });
        }

        const attachments = await collector.buildAttachments();

        expect(attachments.map(({ content }) => Buffer.from(content as string, "base64").byteLength)).toEqual([6, 4]);
        expect(collector.hasUnfetchedImages).toBe(true);
    });

    it("leaves out an image whose fetch failed with a MailImageFetchError", async () => {
        const collector = createCollector({ fetchImage: vi.fn().mockRejectedValue(new MailImageFetchError("image", "timeout")) });
        collector.rewriteImageSrc({ src: damImageUrl("a") });

        await expect(collector.buildAttachments()).resolves.toEqual([]);
        expect(collector.hasUnfetchedImages).toBe(true);
    });

    it("fails on any other error", async () => {
        const collector = createCollector({ fetchImage: vi.fn().mockRejectedValue(new Error("bug")) });
        collector.rewriteImageSrc({ src: damImageUrl("a") });

        await expect(collector.buildAttachments()).rejects.toThrow("bug");
    });

    it("takes an image from the cache", async () => {
        const cache = new MailImageCache();
        const fetchImage = vi.fn(async (_source: MailImageSource) => createImage());
        for (const collector of [createCollector({ fetchImage, cache }), createCollector({ fetchImage, cache })]) {
            collector.rewriteImageSrc({ src: damImageUrl("a") });
            await collector.buildAttachments();
        }

        expect(fetchImage).toHaveBeenCalledTimes(1);
    });
});

describe("MailImageCollector.isImageFetched", () => {
    it("is false for a pixel image block one of whose variants couldn't be fetched", async () => {
        const fetchImage = vi.fn(async (source: MailImageSource) => (source.path.includes("resize:1280") ? null : createImage()));
        const collector = createCollector({ fetchImage });
        collector.rewriteImageSrc({ src: damImageUrl("a", 640) });
        collector.rewriteImageSrc({ src: damImageUrl("a", 1280) });
        collector.rewriteImageSrc({ src: damImageUrl("b", 640) });
        await collector.buildAttachments();

        const urlTemplate = (id: string) => `/dam/images/hash/contenthash/${id}/crop:SMART/resize:$resizeWidth:$resizeHeight/photo`;
        expect(collector.isImageFetched({ urlTemplate: urlTemplate("a") })).toBe(false);
        expect(collector.isImageFetched({ urlTemplate: urlTemplate("b") })).toBe(true);
        expect(collector.isImageFetched({ urlTemplate: `${baseUrl}${urlTemplate("a")}` })).toBe(false);
    });
});
