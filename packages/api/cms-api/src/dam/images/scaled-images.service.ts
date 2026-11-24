import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { PassThrough, Readable } from "stream";

import { BlobStorageBackendService } from "../../blob-storage/backends/blob-storage-backend.service";
import { ScaledImagesCacheService } from "../../blob-storage/cache/scaled-images-cache.service";
import { createHashedPath } from "../../blob-storage/utils/create-hashed-path.util";
import { FocalPoint } from "../../file-utils/focal-point.enum";
import { getCenteredPosition, getMaxDimensionsFromArea } from "../../file-utils/images.util";
import { Extension, Gravity, ResizingType } from "../../imgproxy/imgproxy.enum";
import { ImgproxyService } from "../../imgproxy/imgproxy.service";
import { DamConfig } from "../dam.config";
import { DAM_CONFIG } from "../dam.constants";
import { FileInterface } from "../files/entities/file.entity";
import { ImageParams } from "./dto/image.params";

export interface ScaledImage {
    status: number;
    contentType: string;
    contentLength: number;
    body: NodeJS.ReadableStream;
    /**
     * Settles once the image is stored in the scaled images cache. Only set when the image wasn't cached yet. The cache reads
     * `body` at the same pace as the caller, so await it after starting to read `body`, not before.
     */
    cacheWrite?: Promise<void>;
}

@Injectable()
export class ScaledImagesService {
    constructor(
        @Inject(DAM_CONFIG) private readonly config: DamConfig,
        private readonly imgproxyService: ImgproxyService,
        private readonly cacheService: ScaledImagesCacheService,
        @Inject(forwardRef(() => BlobStorageBackendService)) private readonly blobStorageBackendService: BlobStorageBackendService,
    ) {}

    async getScaledImage(
        file: FileInterface,
        { cropArea, resizeWidth, resizeHeight, focalPoint }: Pick<ImageParams, "cropArea" | "resizeWidth" | "resizeHeight" | "focalPoint">,
        format: Extension,
        { background, signal }: { background?: string; signal?: AbortSignal } = {},
    ): Promise<ScaledImage> {
        if (!file.image) {
            throw new Error(`File ${file.id} is not an image`);
        }

        let cropWidth: number;
        let cropHeight: number;
        let cropOffsetX: number;
        let cropOffsetY: number;
        let cropGravity: Gravity;

        const aspectRatio = resizeWidth / resizeHeight;

        if (focalPoint === FocalPoint.SMART) {
            const maxDimensions = getMaxDimensionsFromArea(
                {
                    width: file.image.width,
                    height: file.image.height,
                },
                aspectRatio,
            );

            cropWidth = maxDimensions.width;
            cropHeight = maxDimensions.height;
            cropOffsetX = 0;
            cropOffsetY = 0;
            cropGravity = Gravity.SMART;
        } else {
            const maxDimensions = getMaxDimensionsFromArea(
                {
                    width: file.image.width * ((cropArea.width as number) / 100),
                    height: file.image.height * ((cropArea.height as number) / 100),
                },
                aspectRatio,
            );
            const position = getCenteredPosition(
                maxDimensions,
                {
                    width: file.image.width * ((cropArea.width as number) / 100),
                    height: file.image.height * ((cropArea.height as number) / 100),
                    x: file.image.width * ((cropArea.x as number) / 100),
                    y: file.image.height * ((cropArea.y as number) / 100),
                },
                focalPoint,
            );

            cropWidth = maxDimensions.width;
            cropHeight = maxDimensions.height;
            cropOffsetX = position.x;
            cropOffsetY = position.y;
            cropGravity = Gravity.NORTHWEST;
        }

        const builder = this.imgproxyService
            .builder()
            .crop(cropWidth, cropHeight, cropGravity, cropOffsetX, cropOffsetY)
            .resize(ResizingType.AUTO, resizeWidth)
            .format(format);
        if (background) {
            builder.setOption("background", background);
        }
        const path = builder.generateUrl(
            `${this.blobStorageBackendService.getBackendFilePathPrefix()}${this.config.filesDirectory}/${createHashedPath(file.contentHash)}`,
        );

        const cache = await this.cacheService.get(file.contentHash, path);
        if (cache) {
            return { status: 200, contentType: cache.metaData.contentType, contentLength: cache.metaData.size, body: cache.file };
        }

        const response = await fetch(this.imgproxyService.getSignedUrl(path), { signal });
        if (response.body === null) {
            throw new Error("Response body is null");
        }

        const contentLength = response.headers.get("content-length");
        if (!contentLength) {
            throw new Error("Content length not found");
        }

        const contentType = response.headers.get("content-type");
        if (!contentType) {
            throw new Error("Content type not found");
        }

        const readableBody = Readable.fromWeb(response.body);
        const body = readableBody.pipe(new PassThrough());

        const cacheWrite = response.ok
            ? this.cacheService.set(file.contentHash, path, {
                  file: readableBody.pipe(new PassThrough()),
                  metaData: {
                      size: Number(contentLength),
                      contentType,
                  },
              })
            : undefined;

        return { status: response.status, contentType, contentLength: Number(contentLength), body, cacheWrite };
    }
}
