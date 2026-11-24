import { Inject, Injectable, Logger } from "@nestjs/common";

import { DamMailImageFetcherService } from "./dam-mail-image-fetcher.service";
import { MailAttachment } from "./mail-attachment";
import { MailImageCache, MailImageCacheOptions } from "./mail-image-cache";
import { MailImageCollector } from "./mail-image-collector";
import { defaultMailImageLimits, MailImageLimits, MailImagesModuleConfig } from "./mail-images.config";
import { MAIL_IMAGES_CONFIG } from "./mail-images.constants";
import { fetchStaticMailImage } from "./static-mail-image-fetcher";

export interface MailImagesRenderContext {
    /** Pass to the mail config as `rewriteImageSrc`. */
    rewriteImageSrc: (image: { src: string }) => string;
    /**
     * Whether the images of a pixel image block could be fetched. `true` in the first render; when an image couldn't be fetched, the mail
     * is rendered once more, and this returns `false` for it, e.g. to render a placeholder instead.
     */
    isImageFetched: (image: { urlTemplate: string }) => boolean;
}

export interface RenderWithImagesOptions<Rendered extends { html: string }> {
    render: (context: MailImagesRenderContext) => Rendered;
    /** Shares the fetched images with the other mails of a run. */
    cache?: MailImageCache;
}

@Injectable()
export class MailImagesService {
    private readonly logger = new Logger(MailImagesService.name);
    private readonly limits: MailImageLimits;

    constructor(
        @Inject(MAIL_IMAGES_CONFIG) private readonly config: MailImagesModuleConfig,
        private readonly damMailImageFetcher: DamMailImageFetcherService,
    ) {
        this.limits = { ...defaultMailImageLimits, ...config.limits };
    }

    /**
     * Renders a mail and fetches the images it renders through `HtmlImage` and `MjmlImage` as inline attachments. A DAM image URL is
     * attached as the variant the image route serves, a relative `src` as a file from `staticFilesDirectory`. Other URLs stay unchanged.
     *
     * An image that can't be fetched is already referenced as `cid:` in the rendered html, and without its attachment most clients show
     * a broken image. So the mail is rendered once more, with `isImageFetched` returning `false` for it.
     */
    async renderWithImages<Rendered extends { html: string }>({
        render,
        cache = this.createCache(),
    }: RenderWithImagesOptions<Rendered>): Promise<{ rendered: Rendered; attachments: MailAttachment[] }> {
        const collector = this.createCollector(cache);
        const rendered = render({ rewriteImageSrc: collector.rewriteImageSrc, isImageFetched: () => true });
        const attachments = await collector.buildAttachments();
        if (!collector.hasUnfetchedImages) {
            return { rendered, attachments };
        }

        // Shares the cache with the first render, so it takes the images that were fetched instead of fetching them again.
        const retryCollector = this.createCollector(cache);
        const retried = render({ rewriteImageSrc: retryCollector.rewriteImageSrc, isImageFetched: collector.isImageFetched });
        const retriedAttachments = await retryCollector.buildAttachments();
        if (retryCollector.hasUnfetchedImages) {
            this.logger.warn("The mail still renders images that could not be fetched.");
        }
        return { rendered: retried, attachments: retriedAttachments };
    }

    /**
     * A cache for the mails of one run, e.g. a newsletter sent to each recipient separately. Pass it to each `renderWithImages` of the run
     * and drop it afterwards: it holds its images until then.
     */
    createCache(options?: MailImageCacheOptions): MailImageCache {
        return new MailImageCache(options);
    }

    private createCollector(cache: MailImageCache): MailImageCollector {
        const { staticFilesDirectory } = this.config;
        return new MailImageCollector({
            baseUrl: this.config.baseUrl,
            damImagesPath: this.damMailImageFetcher.imagesPath,
            hasStaticFiles: staticFilesDirectory !== undefined,
            limits: this.limits,
            cache,
            fetchImage: async (source) => {
                if (source.type === "dam") {
                    return this.damMailImageFetcher.fetchImage(source.path, this.limits);
                }
                return staticFilesDirectory !== undefined ? fetchStaticMailImage(staticFilesDirectory, source.path) : null;
            },
        });
    }
}
