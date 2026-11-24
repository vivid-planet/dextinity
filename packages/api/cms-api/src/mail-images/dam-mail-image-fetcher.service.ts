import { buffer } from "node:stream/consumers";
import { finished } from "node:stream/promises";

import { Inject, Injectable, Logger } from "@nestjs/common";

import { DamConfig } from "../dam/dam.config";
import { DAM_CONFIG } from "../dam/dam.constants";
import { FileInterface } from "../dam/files/entities/file.entity";
import { FilesService } from "../dam/files/files.service";
import { ImagesService } from "../dam/images/images.service";
import { ScaledImage, ScaledImagesService } from "../dam/images/scaled-images.service";
import { FocalPoint } from "../file-utils/focal-point.enum";
import { getBasicImageExtension } from "../file-utils/images.util";
import { Extension } from "../imgproxy/imgproxy.enum";
import { MailImage, MailImageFetchError } from "./mail-image";
import { MailImageLimits } from "./mail-images.config";

interface DamImageUrlParams {
    hash: string;
    contentHash?: string;
    fileId: string;
    focalPoint: FocalPoint;
    cropWidth?: number;
    cropHeight?: number;
    cropX?: number;
    cropY?: number;
    resizeWidth: number;
    resizeHeight: number;
    filename: string;
}

const CONTENT_TYPE_BY_EXTENSION: Partial<Record<Extension, string>> = {
    [Extension.JPG]: "image/jpeg",
    [Extension.PNG]: "image/png",
    [Extension.GIF]: "image/gif",
};

/**
 * Creates the DAM image variant that a URL of the image route (`/<basePath>/images/<hash>/…`) names, like the route itself, but in the
 * file's basic format (JPEG, PNG or GIF): many mail clients can't show WebP or AVIF.
 */
@Injectable()
export class DamMailImageFetcherService {
    private readonly logger = new Logger(DamMailImageFetcherService.name);

    constructor(
        @Inject(DAM_CONFIG) private readonly damConfig: DamConfig,
        private readonly filesService: FilesService,
        private readonly imagesService: ImagesService,
        private readonly scaledImagesService: ScaledImagesService,
    ) {}

    get imagesPath(): string {
        return `/${this.damConfig.basePath}/images/`;
    }

    /**
     * `null` when the URL names no image the route would serve, or the image is over `limits.maxBytesPerImage`: the next mail would get
     * the same answer. A failure that may be gone for the next mail throws `MailImageFetchError`.
     */
    async fetchImage(path: string, limits: MailImageLimits): Promise<MailImage | null> {
        const params = this.parsePath(path);
        if (!params || !this.isValidHash(params) || !this.damConfig.allowedImageSizes.includes(params.resizeWidth)) {
            this.logger.warn(`${path} is not a valid DAM image URL.`);
            return null;
        }

        const file = await this.filesService.findOneById(params.fileId);
        if (!file?.image || (params.contentHash && file.contentHash !== params.contentHash) || this.filesService.hasInvalidLicense(file)) {
            return null;
        }

        const format = getBasicImageExtension(file.mimetype);
        const image = await this.fetchVariant(file, params, format, limits);
        if (image || format !== Extension.PNG) {
            return image;
        }

        // A photo stored as PNG barely shrinks when it's resized, because PNG is lossless. Only a PNG over the limit is re-encoded:
        // converting every PNG would put logos and icons on a white box and blur their sharp edges.
        return this.fetchVariant(file, params, Extension.JPG, limits, { background: "ffffff" });
    }

    private async fetchVariant(
        file: FileInterface,
        params: DamImageUrlParams,
        format: Extension,
        limits: MailImageLimits,
        { background }: { background?: string } = {},
    ): Promise<MailImage | null> {
        const what = `the ${format} variant of DAM file ${file.id}`;
        const cropArea = {
            focalPoint: params.focalPoint,
            width: params.cropWidth,
            height: params.cropHeight,
            x: params.cropX,
            y: params.cropY,
        };

        let scaledImage: ScaledImage;
        try {
            scaledImage = await this.scaledImagesService.getScaledImage(
                file,
                { cropArea, focalPoint: params.focalPoint, resizeWidth: params.resizeWidth, resizeHeight: params.resizeHeight },
                format,
                { background, signal: AbortSignal.timeout(limits.fetchTimeoutMs) },
            );
        } catch (error) {
            throw new MailImageFetchError(what, error instanceof Error ? error.message : String(error));
        }

        const { status, contentLength, body } = scaledImage;
        if (status >= 300 || contentLength > limits.maxBytesPerImage) {
            await this.discard(scaledImage);
            if (status >= 500 || status === 408 || status === 429) {
                throw new MailImageFetchError(what, `status ${status}`);
            }
            if (status < 300) {
                this.logger.warn(`${what} is ${contentLength} bytes, over the limit of ${limits.maxBytesPerImage} bytes.`);
            }
            return null;
        }

        let content: Buffer;
        try {
            content = await buffer(body);
        } catch (error) {
            throw new MailImageFetchError(what, error instanceof Error ? error.message : String(error));
        }
        await this.waitForCacheWrite(scaledImage);

        return {
            buffer: content,
            filename: `${file.name.replace(/\.[^./]*$/, "")}.${format}`,
            contentType: CONTENT_TYPE_BY_EXTENSION[format] ?? scaledImage.contentType,
        };
    }

    private parsePath(path: string): DamImageUrlParams | undefined {
        if (!path.startsWith(this.imagesPath)) {
            return undefined;
        }
        const match = path
            .slice(this.imagesPath.length)
            .match(/^([0-9a-f]{40})(?:\/([0-9a-f]{32}))?\/([0-9a-f-]{36})\/crop:([^/]+)\/resize:(\d+):(\d+)\/([^/?#]+)$/);
        if (!match) {
            return undefined;
        }
        const [, hash, contentHash, fileId, crop, resizeWidth, resizeHeight, filename] = match;
        const cropParts = crop.split(":");
        const focalPoint = (cropParts.length === 1 ? cropParts[0] : cropParts[2]) as FocalPoint;
        if (!Object.values(FocalPoint).includes(focalPoint)) {
            return undefined;
        }
        const cropValues =
            cropParts.length === 5
                ? { cropWidth: Number(cropParts[0]), cropHeight: Number(cropParts[1]), cropX: Number(cropParts[3]), cropY: Number(cropParts[4]) }
                : {};
        if (focalPoint !== FocalPoint.SMART && cropParts.length !== 5) {
            return undefined;
        }

        return {
            hash,
            contentHash,
            fileId,
            focalPoint,
            ...cropValues,
            resizeWidth: Number(resizeWidth),
            resizeHeight: Number(resizeHeight),
            filename,
        };
    }

    private isValidHash({ hash, fileId, filename, focalPoint, cropWidth, cropHeight, cropX, cropY }: DamImageUrlParams): boolean {
        return hash === this.imagesService.createHash({ fileId, filename, focalPoint, cropWidth, cropHeight, cropX, cropY });
    }

    // The scaled images cache reads the body at the same pace as the caller, so a body that isn't used must still be read to the end.
    private async discard(scaledImage: ScaledImage): Promise<void> {
        scaledImage.body.resume();
        await finished(scaledImage.body).catch(() => undefined);
        await this.waitForCacheWrite(scaledImage);
    }

    private async waitForCacheWrite({ cacheWrite }: ScaledImage): Promise<void> {
        await cacheWrite?.catch((error: unknown) => this.logger.warn(`Storing a scaled image in the cache failed: ${String(error)}`));
    }
}
