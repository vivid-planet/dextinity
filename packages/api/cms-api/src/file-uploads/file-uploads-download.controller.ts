import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import {
    BadRequestException,
    Controller,
    Get,
    GoneException,
    Headers,
    Inject,
    Logger,
    NotFoundException,
    Param,
    Res,
    Type,
    UnsupportedMediaTypeException,
} from "@nestjs/common";
import { Response } from "express";
import mime from "mime";
import { PassThrough, Readable } from "stream";

import { DisableDextinityGuards } from "../auth/decorators/disable-dextinity-guards.decorator";
import { BlobStorageBackendService } from "../blob-storage/backends/blob-storage-backend.service";
import { ScaledImagesCacheService } from "../blob-storage/cache/scaled-images-cache.service";
import { createHashedPath } from "../blob-storage/utils/create-hashed-path.util";
import { calculatePartialRanges } from "../file-utils/files.utils";
import { ALL_TYPES, BASIC_TYPES, MODERN_TYPES } from "../file-utils/images.constants";
import { getSupportedMimeType } from "../file-utils/images.util";
import { Extension, ResizingType } from "../imgproxy/imgproxy.enum";
import { ImgproxyService } from "../imgproxy/imgproxy.service";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { DownloadParams, HashDownloadParams, HashImageParams, ImageParams } from "./dto/file-uploads-download.params";
import { FileUpload } from "./entities/file-upload.entity";
import { FileUploadsConfig } from "./file-uploads.config";
import { FILE_UPLOADS_CONFIG } from "./file-uploads.constants";
import { FileUploadsService } from "./file-uploads.service";

export function createFileUploadsDownloadController(options: { public: boolean }): Type<unknown> {
    @Controller("file-uploads")
    class BaseFileUploadsDownloadController {
        protected readonly logger = new Logger(BaseFileUploadsDownloadController.name);
        constructor(
            @InjectRepository(FileUpload) private readonly fileUploadsRepository: EntityRepository<FileUpload>,
            @Inject(BlobStorageBackendService) private readonly blobStorageBackendService: BlobStorageBackendService,
            @Inject(FILE_UPLOADS_CONFIG) private readonly config: FileUploadsConfig,
            private readonly fileUploadsService: FileUploadsService,
            private readonly cacheService: ScaledImagesCacheService,
            private readonly imgproxyService: ImgproxyService,
        ) {}

        @Get(":hash/:id/:timeout")
        async download(@Param() { hash, ...params }: HashDownloadParams, @Res() res: Response, @Headers("range") range?: string): Promise<void> {
            const file = await this.fileUploadsRepository.findOne(params.id);

            if (!file) {
                throw new NotFoundException();
            }

            res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
            await this.streamFile(file, { hash, ...params }, res, range);
        }

        @Get("preview/:hash/:id/:timeout")
        async preview(@Param() { hash, ...params }: HashDownloadParams, @Res() res: Response, @Headers("range") range?: string): Promise<void> {
            const file = await this.fileUploadsRepository.findOne(params.id);

            if (!file) {
                throw new NotFoundException();
            }

            res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
            await this.streamFile(file, { hash, ...params }, res, range);
        }

        private async streamFile(file: FileUpload, { hash, ...params }: HashDownloadParams, res: Response, range?: string) {
            if (!this.isValidHash(hash, params)) {
                throw new BadRequestException("Invalid hash");
            }

            if (Date.now() > params.timeout) {
                throw new GoneException();
            }

            const filePath = createHashedPath(file.contentHash);
            const fileExists = await this.blobStorageBackendService.fileExists(this.config.directory, filePath);

            if (!fileExists) {
                throw new NotFoundException();
            }

            const headers = {
                "content-type": file.mimetype,
                "last-modified": file.updatedAt?.toUTCString(),
                "content-length": file.size,
                "cache-control": "no-store",
            };

            // https://medium.com/@vishal1909/how-to-handle-partial-content-in-node-js-8b0a5aea216
            let stream: Readable;

            if (range) {
                const { start, end, contentLength } = calculatePartialRanges(file.size, range);

                if (start >= file.size || end >= file.size) {
                    res.writeHead(416, {
                        "content-range": `bytes */${file.size}`,
                    });
                    res.end();
                    return;
                }

                stream = await this.blobStorageBackendService.getPartialFile(
                    this.config.directory,
                    createHashedPath(file.contentHash),
                    start,
                    contentLength,
                );

                stream.on("error", (error) => {
                    this.logger.error("Stream error:", error);
                    res.end();
                });

                res.on("close", () => {
                    stream.destroy();
                });

                res.writeHead(206, {
                    ...headers,
                    "accept-ranges": "bytes",
                    "content-range": `bytes ${start}-${end}/${file.size}`,
                    "content-length": contentLength,
                });
            } else {
                stream = await this.blobStorageBackendService.getFile(this.config.directory, createHashedPath(file.contentHash));

                stream.on("error", (error) => {
                    this.logger.error("Stream error:", error);
                    res.end();
                });

                res.on("close", () => {
                    stream.destroy();
                });

                res.writeHead(200, headers);
            }

            stream.pipe(res);
        }

        @Get(":hash/:id/:timeout/:resizeWidth/:filename")
        async image(@Param() { hash, ...params }: HashImageParams, @Res() res: Response, @Headers("Accept") accept: string): Promise<void> {
            if (!this.isValidHash(hash, params)) {
                throw new BadRequestException("Invalid hash");
            }

            if (Date.now() > params.timeout) {
                throw new GoneException();
            }

            const file = await this.fileUploadsRepository.findOne(params.id);

            if (!file) {
                throw new NotFoundException();
            }

            if (!ALL_TYPES.includes(file.mimetype)) {
                throw new UnsupportedMediaTypeException();
            }

            const filePath = createHashedPath(file.contentHash);
            const fileExists = await this.blobStorageBackendService.fileExists(this.config.directory, filePath);

            if (!fileExists) {
                throw new NotFoundException();
            }

            const path = this.imgproxyService
                .builder()
                .resize(ResizingType.AUTO, params.resizeWidth)
                .format(
                    (mime.getExtension(
                        getSupportedMimeType(MODERN_TYPES, accept) ?? getSupportedMimeType(BASIC_TYPES, file.mimetype) ?? "",
                    ) as Extension) || Extension.JPG,
                )
                .generateUrl(`${this.blobStorageBackendService.getBackendFilePathPrefix()}${this.config.directory}/${filePath}`);

            const cache = await this.cacheService.get(file.contentHash, path);
            if (!cache) {
                const response = await fetch(this.imgproxyService.getSignedUrl(path));
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

                res.writeHead(response.status, { "content-length": contentLength, "content-type": contentType, "cache-control": "no-store" });

                const readableBody = Readable.fromWeb(response.body);
                readableBody.pipe(new PassThrough()).pipe(res);

                if (response.ok) {
                    await this.cacheService.set(file.contentHash, path, {
                        file: readableBody.pipe(new PassThrough()),
                        metaData: {
                            size: Number(contentLength),
                            contentType: contentType,
                        },
                    });
                }
            } else {
                res.writeHead(200, {
                    "content-type": cache.metaData.contentType,
                    "content-length": cache.metaData.size,
                    "cache-control": "no-store",
                });

                cache.file.pipe(res);
            }
        }

        private isValidHash(hash: string, params: DownloadParams | ImageParams): boolean {
            return hash === this.fileUploadsService.createHash(params);
        }
    }

    if (options.public) {
        @DisableDextinityGuards()
        class PublicFileUploadsDownloadController extends BaseFileUploadsDownloadController {
            protected readonly logger = new Logger(PublicFileUploadsDownloadController.name);
        }

        return PublicFileUploadsDownloadController;
    }

    @RequiredPermission("fileUploads", { skipScopeCheck: true })
    class PrivateFileUploadsDownloadController extends BaseFileUploadsDownloadController {
        protected readonly logger = new Logger(PrivateFileUploadsDownloadController.name);
    }

    return PrivateFileUploadsDownloadController;
}
