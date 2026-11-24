import { randomUUID } from "node:crypto";

import { Logger } from "@nestjs/common";

import type { MailAttachment } from "./mail-attachment";
import { type MailImage, MailImageFetchError } from "./mail-image";
import type { MailImageCache } from "./mail-image-cache";
import type { MailImageLimits } from "./mail-images.config";

export type MailImageSource = { type: "dam"; path: string } | { type: "static"; path: string };

interface MailImageCollectorOptions {
    /** The URL that the DAM image URLs of the mail start with. */
    baseUrl: string;
    /** The path of the DAM image route below `baseUrl`, e.g. `/dam/images/`. */
    damImagesPath: string;
    /** Whether a relative `src` is attached as a static file. */
    hasStaticFiles: boolean;
    limits: MailImageLimits;
    fetchImage: (source: MailImageSource) => Promise<MailImage | null>;
    cache?: MailImageCache;
}

/**
 * Collects the images that one mail renders, through `rewriteImageSrc`, and fetches them once the mail is rendered: rendering is
 * synchronous, so the `src` handed out during the render is a `cid:` reference whose content is fetched afterwards.
 */
export class MailImageCollector {
    private readonly logger = new Logger(MailImageCollector.name);
    private readonly imagesBySrc = new Map<string, { contentId: string; source: MailImageSource }>();
    private readonly unfetchedSrcs = new Set<string>();

    constructor(private readonly options: MailImageCollectorOptions) {}

    readonly rewriteImageSrc = ({ src }: { src: string }): string => {
        const existing = this.imagesBySrc.get(src);
        if (existing) {
            return `cid:${existing.contentId}`;
        }
        const source = this.getSource(src);
        if (!source) {
            return src;
        }
        const contentId = randomUUID();
        this.imagesBySrc.set(src, { contentId, source });
        return `cid:${contentId}`;
    };

    /**
     * The attachments of the images that could be fetched within the limits. The content is a base64 string, not a `Buffer`:
     * `MailerService` stores the attachments in `MailerLog`, where a `Buffer` takes about three times the size.
     */
    async buildAttachments(): Promise<MailAttachment[]> {
        const imagesBySrc = await this.fetchWithinLimits();

        const attachments: MailAttachment[] = [];
        for (const [src, { contentId }] of this.imagesBySrc) {
            const image = imagesBySrc.get(src);
            if (image) {
                attachments.push({
                    filename: image.filename,
                    content: image.buffer.toString("base64"),
                    encoding: "base64",
                    cid: contentId,
                    contentDisposition: "inline",
                    contentType: image.contentType,
                });
            }
        }
        return attachments;
    }

    /** Whether an image the mail renders couldn't be fetched or didn't fit into the limits. */
    get hasUnfetchedImages(): boolean {
        return this.unfetchedSrcs.size > 0;
    }

    /** Whether every variant of a pixel image block was fetched, e.g. to render a placeholder instead of an image that wasn't. */
    readonly isImageFetched = ({ urlTemplate }: { urlTemplate: string }): boolean => {
        const urlUpToResize = urlTemplate.split("$resizeWidth")[0];
        const prefix = urlUpToResize.startsWith("/") ? `${this.options.baseUrl}${urlUpToResize}` : urlUpToResize;
        return ![...this.unfetchedSrcs].some((src) => src.startsWith(prefix));
    };

    private getSource(src: string): MailImageSource | undefined {
        const { baseUrl, damImagesPath, hasStaticFiles } = this.options;
        if (src.startsWith(`${baseUrl}${damImagesPath}`)) {
            return { type: "dam", path: src.slice(baseUrl.length) };
        }
        // A URL with a scheme (`https:`, `data:`, `cid:`) or an absolute path is left to the mail client.
        if (!hasStaticFiles || /^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith("/")) {
            return undefined;
        }
        return { type: "static", path: src };
    }

    // In the order the mail renders its images, so the first images of the mail are the ones that stay within the limits.
    private async fetchWithinLimits(): Promise<Map<string, MailImage | null>> {
        const { maxImagesPerMail, maxTotalBytesPerMail, fetchConcurrency } = this.options.limits;
        const entries = [...this.imagesBySrc];
        const imagesBySrc = new Map<string, MailImage | null>();
        let remainingBytes = maxTotalBytesPerMail;

        if (entries.length > maxImagesPerMail) {
            this.logger.warn(`Mail renders ${entries.length} images; only the first ${maxImagesPerMail} are attached.`);
        }
        const fetchedEntries = entries.slice(0, maxImagesPerMail);

        for (let index = 0; index < fetchedEntries.length; index += fetchConcurrency) {
            const batch = fetchedEntries.slice(index, index + fetchConcurrency);
            const results = await Promise.all(batch.map(async ([src, { source }]) => ({ src, image: await this.fetchImage(source) })));
            for (const { src, image } of results) {
                if (!image) {
                    this.setUnfetched(imagesBySrc, src);
                } else if (image.buffer.byteLength > remainingBytes) {
                    // Skipped rather than ending the pass, so one large image doesn't use up the budget that smaller ones after it fit into.
                    this.logger.warn(`${src} doesn't fit into the remaining ${remainingBytes} bytes of the mail; it is left out.`);
                    this.setUnfetched(imagesBySrc, src);
                } else {
                    remainingBytes -= image.buffer.byteLength;
                    imagesBySrc.set(src, image);
                }
            }
        }
        for (const [src] of entries.slice(maxImagesPerMail)) {
            this.setUnfetched(imagesBySrc, src);
        }
        return imagesBySrc;
    }

    private setUnfetched(imagesBySrc: Map<string, MailImage | null>, src: string): void {
        imagesBySrc.set(src, null);
        this.unfetchedSrcs.add(src);
    }

    private async fetchImage(source: MailImageSource): Promise<MailImage | null> {
        const { cache, fetchImage } = this.options;
        try {
            const image = cache ? await cache.fetch(`${source.type}:${source.path}`, () => fetchImage(source)) : await fetchImage(source);
            if (!image) {
                this.logger.warn(`Leaving out an image: ${source.path} could not be fetched.`);
            }
            return image;
        } catch (error) {
            if (error instanceof MailImageFetchError) {
                this.logger.warn(`Leaving out an image: ${error.message}`);
                return null;
            }
            throw error;
        }
    }
}
