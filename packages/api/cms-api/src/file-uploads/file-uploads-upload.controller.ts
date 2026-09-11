import { EntityManager } from "@mikro-orm/postgresql";
import { Body, Controller, Inject, Post, Type, UploadedFile, UseInterceptors } from "@nestjs/common";
import { rimraf } from "rimraf";

import { DisableDextinityGuards } from "../auth/decorators/disable-dextinity-guards.decorator";
import { FileUploadInput } from "../file-utils/file-upload.input";
import { RequiredPermission } from "../user-permissions/decorators/required-permission.decorator";
import { FileUploadBody } from "./dto/file-upload.body";
import { FileUpload } from "./entities/file-upload.entity";
import { FileUploadsConfig } from "./file-uploads.config";
import { FILE_UPLOADS_CONFIG } from "./file-uploads.constants";
import { FileUploadsService } from "./file-uploads.service";
import { FileUploadsFileInterceptor } from "./file-uploads-file.interceptor";

type FileUploadsUploadResponse = Pick<FileUpload, "id" | "name" | "size" | "mimetype" | "contentHash" | "createdAt" | "updatedAt"> & {
    downloadUrl?: string;
};

export function createFileUploadsUploadController(options: { public: boolean }): Type<unknown> {
    @Controller("file-uploads")
    class BaseFileUploadsUploadController {
        constructor(
            private readonly fileUploadsService: FileUploadsService,
            private readonly entityManager: EntityManager,
            @Inject(FILE_UPLOADS_CONFIG) private readonly config: FileUploadsConfig,
        ) {}

        @Post("upload")
        @UseInterceptors(FileUploadsFileInterceptor())
        async upload(@UploadedFile() file: FileUploadInput, @Body() body: FileUploadBody): Promise<FileUploadsUploadResponse> {
            const fileUpload = await this.fileUploadsService.upload(file, body.expiresIn);

            await this.entityManager.flush();

            try {
                await rimraf(file.path);
            } catch (error) {
                console.error("An error occurred when removing the file: ", error);
            }

            let downloadUrl: string | undefined;

            if (this.config.download) {
                downloadUrl = this.fileUploadsService.createDownloadUrl(fileUpload);
            }

            return {
                ...fileUpload,
                downloadUrl,
            };
        }
    }

    if (options.public) {
        @DisableDextinityGuards()
        class PublicFileUploadsUploadController extends BaseFileUploadsUploadController {}

        return PublicFileUploadsUploadController;
    }

    @RequiredPermission("fileUploads", { skipScopeCheck: true })
    class PrivateFileUploadsUploadController extends BaseFileUploadsUploadController {}

    return PrivateFileUploadsUploadController;
}
