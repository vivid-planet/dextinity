import {
    BadRequestException,
    Controller,
    ForbiddenException,
    forwardRef,
    Get,
    Headers,
    Inject,
    NotFoundException,
    Param,
    Res,
    Type,
} from "@nestjs/common";
import { Response } from "express";
import { OutgoingHttpHeaders } from "http";
import mime from "mime";
import { PassThrough, Readable } from "stream";

import { DisableDextinityGuards } from "../../auth/decorators/disable-dextinity-guards.decorator";
import { GetCurrentUser } from "../../auth/decorators/get-current-user.decorator";
import { BlobStorageBackendService } from "../../blob-storage/backends/blob-storage-backend.service";
import { ScaledImagesCacheService } from "../../blob-storage/cache/scaled-images-cache.service";
import { createHashedPath } from "../../blob-storage/utils/create-hashed-path.util";
import { FocalPoint } from "../../file-utils/focal-point.enum";
import { BASIC_TYPES, MODERN_TYPES } from "../../file-utils/images.constants";
import { getCenteredPosition, getMaxDimensionsFromArea, getSupportedMimeType } from "../../file-utils/images.util";
import { Extension, Gravity, ResizingType } from "../../imgproxy/imgproxy.enum";
import { ImgproxyService } from "../../imgproxy/imgproxy.service";
import { RequiredPermission } from "../../user-permissions/decorators/required-permission.decorator";
import { CurrentUser } from "../../user-permissions/dto/current-user";
import { DamConfig } from "../dam.config";
import { DAM_CONFIG } from "../dam.constants";
import { FileInterface } from "../files/entities/file.entity";
import { FilesService } from "../files/files.service";
import { DamScopeAccessControlService } from "../scope-access-control.service";
import { HashImageParams, ImageParams } from "./dto/image.params";
import { ImagesService } from "./images.service";

const smartImageUrl = `:fileId/crop\\::focalPoint/resize\\::resizeWidth\\::resizeHeight/:filename`;
const focusImageUrl = `:fileId/crop\\::cropWidth\\::cropHeight\\::focalPoint\\::cropX\\::cropY/resize\\::resizeWidth\\::resizeHeight/:filename`;

export const createImagesController = ({ damBasePath }: { damBasePath: string }): Type<unknown> => {
    @Controller(`${damBasePath}/images`)
    @RequiredPermission(["dam"], { skipScopeCheck: true }) // Scopes are checked in Code
    class ImagesController {
        constructor(
            @Inject(DAM_CONFIG) private readonly config: DamConfig,
            private readonly imgproxyService: ImgproxyService,
            @Inject(forwardRef(() => FilesService)) private readonly filesService: FilesService,
            private readonly imagesService: ImagesService,
            private readonly cacheService: ScaledImagesCacheService,
            @Inject(forwardRef(() => BlobStorageBackendService)) private readonly blobStorageBackendService: BlobStorageBackendService,
            private readonly scopeAccessControl: DamScopeAccessControlService,
        ) {}

        @Get(`/preview{/:contentHash}/${focusImageUrl}`)
        async previewFocusCroppedImage(
            @Param() params: ImageParams,
            @Headers("Accept") accept: string,
            @Res() res: Response,
            @GetCurrentUser() user: CurrentUser,
        ): Promise<void> {
            if (params.cropArea.focalPoint === FocalPoint.SMART) {
                throw new NotFoundException();
            }

            const file = await this.filesService.findOneById(params.fileId);
            if (file === null) {
                throw new NotFoundException();
            }

            if (params.contentHash && file.contentHash !== params.contentHash) {
                throw new BadRequestException("Content Hash mismatch!");
            }

            if (file.scope !== undefined && !this.scopeAccessControl.isAllowed(user, file.scope)) {
                throw new ForbiddenException();
            }

            return this.pipeCroppedImage(file, params, accept, res, {
                "cache-control": "max-age=31536000, private", // Local caches only (1 year)
            });
        }

        @Get(`/preview{/:contentHash}/${smartImageUrl}`)
        async previewSmartCroppedImage(
            @Param() params: ImageParams,
            @Headers("Accept") accept: string,
            @Res() res: Response,
            @GetCurrentUser() user: CurrentUser,
        ): Promise<void> {
            if (params.cropArea.focalPoint !== FocalPoint.SMART) {
                throw new NotFoundException();
            }

            const file = await this.filesService.findOneById(params.fileId);

            if (file === null) {
                throw new NotFoundException();
            }

            if (params.contentHash && file.contentHash !== params.contentHash) {
                throw new BadRequestException("Content Hash mismatch!");
            }

            if (file.scope !== undefined && !this.scopeAccessControl.isAllowed(user, file.scope)) {
                throw new ForbiddenException();
            }

            return this.pipeCroppedImage(file, params, accept, res, {
                "cache-control": "max-age=31536000, private", // Local caches only (1 year)
            });
        }

        @DisableDextinityGuards()
        @Get(`/:hash{/:contentHash}/${focusImageUrl}`)
        async focusCroppedImage(@Param() params: HashImageParams, @Headers("Accept") accept: string, @Res() res: Response): Promise<void> {
            if (!this.isValidHash(params) || params.cropArea.focalPoint === FocalPoint.SMART) {
                throw new BadRequestException("Invalid hash");
            }

            const file = await this.filesService.findOneById(params.fileId);
            if (file === null) {
                throw new NotFoundException();
            }

            if (params.contentHash && file.contentHash !== params.contentHash) {
                throw new BadRequestException("Content Hash mismatch!");
            }

            return this.pipeCroppedImage(file, params, accept, res, {
                "cache-control": "max-age=31536000, s-maxage=86400, public", // Public cache, 1 year for browsers, 1 day for proxies/cdn's
            });
        }

        @DisableDextinityGuards()
        @Get(`/:hash{/:contentHash}/${smartImageUrl}`)
        async smartCroppedImage(@Param() params: HashImageParams, @Headers("Accept") accept: string, @Res() res: Response): Promise<void> {
            if (!this.isValidHash(params) || params.cropArea.focalPoint !== FocalPoint.SMART) {
                throw new BadRequestException("Invalid hash");
            }

            const file = await this.filesService.findOneById(params.fileId);
            if (file === null) {
                throw new NotFoundException();
            }

            if (params.contentHash && file.contentHash !== params.contentHash) {
                throw new BadRequestException("Content Hash mismatch!");
            }

            return this.pipeCroppedImage(file, params, accept, res, {
                "cache-control": "max-age=31536000, s-maxage=86400, public", // Public cache, 1 year for browsers, 1 day for proxies/cdn's
            });
        }

        private isValidHash({ hash, ...imageParams }: HashImageParams): boolean {
            return hash === this.imagesService.createHash(imageParams);
        }

        private async pipeCroppedImage(
            file: FileInterface,
            { cropArea, resizeWidth, resizeHeight, focalPoint }: ImageParams,
            accept: string,
            res: Response,
            headers?: OutgoingHttpHeaders,
        ): Promise<void> {
            if (!file.image) {
                throw new NotFoundException();
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

            const path = this.imgproxyService
                .builder()
                .crop(cropWidth, cropHeight, cropGravity, cropOffsetX, cropOffsetY)
                .resize(ResizingType.AUTO, resizeWidth)
                .format(
                    (mime.getExtension(
                        getSupportedMimeType(MODERN_TYPES, accept) ?? getSupportedMimeType(BASIC_TYPES, file.mimetype) ?? "",
                    ) as Extension) || Extension.JPG,
                )
                .generateUrl(
                    `${this.blobStorageBackendService.getBackendFilePathPrefix()}${this.config.filesDirectory}/${createHashedPath(file.contentHash)}`,
                );

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

                res.writeHead(response.status, { ...headers, "content-length": contentLength, "content-type": contentType });

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
                res.writeHead(200, { ...headers, "content-type": cache.metaData.contentType, "content-length": cache.metaData.size });

                cache.file.pipe(res);
            }
        }
    }
    return ImagesController;
};
