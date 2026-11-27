import {
    BadRequestException,
    Controller,
    ForbiddenException,
    forwardRef,
    Get,
    GoneException,
    Headers,
    HttpStatus,
    Inject,
    NotFoundException,
    Param,
    Res,
    Type,
} from "@nestjs/common";
import { Response } from "express";
import { OutgoingHttpHeaders } from "http";
import mime from "mime";

import { DisableDextinityGuards } from "../../auth/decorators/disable-dextinity-guards.decorator";
import { GetCurrentUser } from "../../auth/decorators/get-current-user.decorator";
import { FocalPoint } from "../../file-utils/focal-point.enum";
import { MODERN_TYPES } from "../../file-utils/images.constants";
import { getBasicImageMimeType, getSupportedMimeType } from "../../file-utils/images.util";
import { Extension } from "../../imgproxy/imgproxy.enum";
import { RequiredPermission } from "../../user-permissions/decorators/required-permission.decorator";
import { CurrentUser } from "../../user-permissions/dto/current-user";
import { FileInterface } from "../files/entities/file.entity";
import { FilesService } from "../files/files.service";
import { DamScopeAccessControlService } from "../scope-access-control.service";
import { HashImageParams, ImageParams } from "./dto/image.params";
import { ImagesService } from "./images.service";
import { ScaledImagesService } from "./scaled-images.service";

const smartImageUrl = `:fileId/crop\\::focalPoint/resize\\::resizeWidth\\::resizeHeight/:filename`;
const focusImageUrl = `:fileId/crop\\::cropWidth\\::cropHeight\\::focalPoint\\::cropX\\::cropY/resize\\::resizeWidth\\::resizeHeight/:filename`;

const publicCacheControl = "max-age=31536000, s-maxage=86400, public";

export const createImagesController = ({ damBasePath }: { damBasePath: string }): Type<unknown> => {
    @Controller(`${damBasePath}/images`)
    @RequiredPermission(["dam"], { skipScopeCheck: true }) // Scopes are checked in Code
    class ImagesController {
        constructor(
            @Inject(forwardRef(() => FilesService)) private readonly filesService: FilesService,
            private readonly imagesService: ImagesService,
            private readonly scaledImagesService: ScaledImagesService,
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
            if (file === null || !file.image) {
                throw new NotFoundException();
            }

            if (params.contentHash && file.contentHash !== params.contentHash) {
                throw new BadRequestException("Content Hash mismatch!");
            }

            this.throwIfLicenseIsInvalid(file, res);

            if (this.imagesService.shouldRedirectToCurrentUrl(file, params.filename)) {
                return this.redirectToCurrentUrl({ file, params, res });
            }

            return this.pipeCroppedImage(file, params, accept, res, { "cache-control": publicCacheControl });
        }

        @DisableDextinityGuards()
        @Get(`/:hash{/:contentHash}/${smartImageUrl}`)
        async smartCroppedImage(@Param() params: HashImageParams, @Headers("Accept") accept: string, @Res() res: Response): Promise<void> {
            if (!this.isValidHash(params) || params.cropArea.focalPoint !== FocalPoint.SMART) {
                throw new BadRequestException("Invalid hash");
            }

            const file = await this.filesService.findOneById(params.fileId);
            if (file === null || !file.image) {
                throw new NotFoundException();
            }

            if (params.contentHash && file.contentHash !== params.contentHash) {
                throw new BadRequestException("Content Hash mismatch!");
            }

            this.throwIfLicenseIsInvalid(file, res);

            if (this.imagesService.shouldRedirectToCurrentUrl(file, params.filename)) {
                return this.redirectToCurrentUrl({ file, params, res });
            }

            return this.pipeCroppedImage(file, params, accept, res, { "cache-control": publicCacheControl });
        }

        private isValidHash({ hash, ...imageParams }: HashImageParams): boolean {
            return hash === this.imagesService.createHash(imageParams);
        }

        private throwIfLicenseIsInvalid(file: FileInterface, res: Response): void {
            if (this.filesService.hasInvalidLicense(file)) {
                res.setHeader("cache-control", "no-store"); // The image must be delivered again once the license becomes valid
                throw new GoneException();
            }
        }

        private redirectToCurrentUrl({ file, params, res }: { file: FileInterface; params: ImageParams; res: Response }): void {
            const { cropArea, resizeWidth, resizeHeight } = params;
            res.setHeader("cache-control", publicCacheControl);
            res.redirect(HttpStatus.MOVED_PERMANENTLY, this.imagesService.createUrl({ file, cropArea, resizeWidth, resizeHeight }));
        }

        private async pipeCroppedImage(
            file: FileInterface,
            params: ImageParams,
            accept: string,
            res: Response,
            headers?: OutgoingHttpHeaders,
        ): Promise<void> {
            if (!file.image) {
                throw new NotFoundException();
            }

            const format = mime.getExtension(getSupportedMimeType(MODERN_TYPES, accept) ?? getBasicImageMimeType(file.mimetype)) as Extension;

            res.vary("Accept");

            const { status, contentType, contentLength, body, cacheWrite } = await this.scaledImagesService.getScaledImage(file, params, format);
            res.writeHead(status, { ...headers, "content-length": contentLength, "content-type": contentType });
            body.pipe(res);
            await cacheWrite;
        }
    }
    return ImagesController;
};
