import { Logger } from "@nestjs/common";

import type { MailImage } from "./mail-image";

export interface MailImageCacheStats {
    maxBytes: number;
    cachedBytes: number;
    cachedImages: number;
    rejectedBytes: number;
}

export interface MailImageCacheOptions {
    /** @default 64 MB */
    maxBytes?: number;
    /**
     * Called once, the first time an image doesn't fit into `maxBytes` anymore: a sign that the budget is too small for the run. Logs a
     * warning by default.
     */
    onBudgetExceeded?: (stats: MailImageCacheStats) => void;
}

/**
 * Shares the images fetched for one mail with the next mails of the same run, e.g. the images that most recipients of a newsletter get.
 *
 * Nothing is evicted, so the cache must not outlive the run: create one per run and pass it to each `renderWithImages`. The images are
 * `Buffer`s outside the V8 heap, so the memory limit of the process must leave room for `maxBytes`.
 */
export class MailImageCache {
    private readonly logger = new Logger(MailImageCache.name);
    private readonly entries = new Map<string, Promise<MailImage | null>>();
    private readonly maxBytes: number;
    private readonly onBudgetExceeded: (stats: MailImageCacheStats) => void;
    private cachedBytes = 0;
    private cachedImages = 0;
    private rejectedBytes = 0;
    private hasReportedExceededBudget = false;
    private hitCount = 0;
    private missCount = 0;

    constructor({ maxBytes = 64 * 1024 * 1024, onBudgetExceeded }: MailImageCacheOptions = {}) {
        this.maxBytes = maxBytes;
        this.onBudgetExceeded =
            onBudgetExceeded ??
            ((stats) =>
                this.logger.warn(
                    `Mail image cache budget of ${stats.maxBytes} bytes exceeded with ${stats.cachedImages} images (${stats.cachedBytes} bytes) cached; images that no longer fit are fetched per mail.`,
                ));
    }

    /**
     * The result of `fetchImage` for `key`, fetched once. An image that comes up empty stays cached as such, because the next mail would
     * get the same answer. A fetch that throws isn't cached, so the next mail tries again.
     */
    fetch(key: string, fetchImage: () => Promise<MailImage | null>): Promise<MailImage | null> {
        const cached = this.entries.get(key);
        if (cached) {
            this.hitCount++;
            return cached;
        }
        this.missCount++;
        const entry = fetchImage().then(
            (image) => {
                this.keepWithinBudget(key, image);
                return image;
            },
            (error: unknown) => {
                this.entries.delete(key);
                throw error;
            },
        );
        this.entries.set(key, entry);
        return entry;
    }

    /** Requests the cache served without fetching. */
    get hits(): number {
        return this.hitCount;
    }

    /** Requests that had to fetch. */
    get misses(): number {
        return this.missCount;
    }

    // An image that would exceed the budget is still returned to the mail that asked for it, but not kept, so the cache can't run the
    // process out of memory.
    private keepWithinBudget(key: string, image: MailImage | null): void {
        const byteLength = image?.buffer.byteLength ?? 0;
        if (this.cachedBytes + byteLength <= this.maxBytes) {
            this.cachedBytes += byteLength;
            if (image) {
                this.cachedImages++;
            }
            return;
        }
        this.entries.delete(key);
        this.rejectedBytes += byteLength;
        if (!this.hasReportedExceededBudget) {
            this.hasReportedExceededBudget = true;
            this.onBudgetExceeded({
                maxBytes: this.maxBytes,
                cachedBytes: this.cachedBytes,
                cachedImages: this.cachedImages,
                rejectedBytes: this.rejectedBytes,
            });
        }
    }
}
