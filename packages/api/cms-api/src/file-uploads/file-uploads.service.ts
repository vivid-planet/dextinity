import { CreateRequestContext, EntityManager, MikroORM } from "@mikro-orm/postgresql";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { createHmac } from "crypto";
import { addHours, addSeconds } from "date-fns";
import { basename, extname, parse } from "path";
import { Readable } from "stream";

import { BlobStorageBackendService } from "../blob-storage/backends/blob-storage-backend.service";
import { createHashedPath } from "../blob-storage/utils/create-hashed-path.util";
import { FileUploadInput } from "../file-utils/file-upload.input";
import { calculateFileHash, slugifyFilename } from "../file-utils/files.utils";
import { ALL_TYPES } from "../file-utils/images.constants";
import { DownloadParams, ImageParams } from "./dto/file-uploads-download.params";
import { FileUpload } from "./entities/file-upload.entity";
import { FileUploadsConfig } from "./file-uploads.config";
import { FILE_UPLOADS_CONFIG } from "./file-uploads.constants";

@Injectable()
export class FileUploadsService {
    private deleteExpiredFilesInterval: NodeJS.Timeout;

    constructor(
        private readonly orm: MikroORM,
        @Inject(forwardRef(() => BlobStorageBackendService)) private readonly blobStorageBackendService: BlobStorageBackendService,
        @Inject(FILE_UPLOADS_CONFIG) private readonly config: FileUploadsConfig,
        private readonly entityManager: EntityManager,
    ) {}

    onApplicationBootstrap() {
        // Delete expired files every minute
        this.deleteExpiredFilesInterval = setInterval(async () => {
            try {
                await this.deleteExpiredFiles();
            } catch (error) {
                console.error("Error while deleting expired files", error);
            }
        }, 60000);
    }

    beforeApplicationShutdown() {
        clearInterval(this.deleteExpiredFilesInterval);
    }

    async upload(file: FileUploadInput, expiresIn?: number): Promise<FileUpload> {
        const contentHash = await calculateFileHash(file.path);
        await this.blobStorageBackendService.upload(file, contentHash, this.config.directory);

        const extension = extname(file.originalname);
        const filename = basename(file.originalname, extension);
        const name = slugifyFilename(filename, extension);

        const expires = expiresIn || this.config.expiresIn;
        const fileUpload = this.entityManager.create(FileUpload, {
            name,
            size: file.size,
            mimetype: file.mimetype,
            contentHash,
            expiresAt: expires ? addSeconds(new Date(), expires) : undefined,
        });

        this.entityManager.persist(fileUpload);

        return fileUpload;
    }

    createHash(params: DownloadParams | ImageParams): string {
        if (!this.config.download) {
            throw new Error("File Uploads: Missing download configuration");
        }

        let hash = `file-upload:${params.id}:${params.timeout}`;

        if (params instanceof ImageParams) {
            hash += `:${params.resizeWidth}:${params.filename}`;
        }

        return createHmac("sha1", this.config.download.secret).update(hash).digest("hex");
    }

    createDownloadUrl(file: FileUpload): string {
        if (!this.config.download) {
            throw new Error("File Uploads: Missing download configuration");
        }

        const timeout = addHours(new Date(), 1).getTime();

        const hash = this.createHash({
            id: file.id,
            timeout,
        });

        return ["/file-uploads", hash, file.id, timeout].join("/");
    }

    createImageUrl(file: FileUpload, resizeWidth: number): string | undefined {
        if (!ALL_TYPES.includes(file.mimetype)) {
            return undefined;
        }

        const timeout = addHours(new Date(), 1).getTime();

        const hash = this.createHash({
            id: file.id,
            timeout,
            resizeWidth,
        });

        const filename = parse(file.name).name;

        return ["/file-uploads", hash, file.id, timeout, resizeWidth, filename].join("/");
    }

    createPreviewUrl(file: FileUpload): string {
        const timeout = addHours(new Date(), 1).getTime();

        const hash = this.createHash({
            id: file.id,
            timeout,
        });

        return ["/file-uploads", "preview", hash, file.id, timeout].join("/");
    }

    async getFileContent(file: FileUpload): Promise<Buffer> {
        const filePath = createHashedPath(file.contentHash);
        const fileExists = await this.blobStorageBackendService.fileExists(this.config.directory, filePath);

        if (!fileExists) {
            throw new Error("File not found");
        }

        const stream = await this.blobStorageBackendService.getFile(this.config.directory, filePath);

        const chunks: Buffer[] = [];
        for await (const chunk of stream as Readable) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const buffer = Buffer.concat(chunks);
        return buffer;
    }

    async delete(fileUpload: FileUpload): Promise<void> {
        const filePath = createHashedPath(fileUpload.contentHash);
        if (await this.blobStorageBackendService.fileExists(this.config.directory, filePath)) {
            await this.blobStorageBackendService.removeFile(this.config.directory, filePath);
        }

        this.entityManager.remove(fileUpload);
    }

    acceptsMimeType(mimeType: string): boolean {
        return this.config.acceptedMimeTypes.includes(mimeType);
    }

    @CreateRequestContext()
    async deleteExpiredFiles(): Promise<void> {
        let hasMore = false;
        const limit = 100;
        do {
            const files = await this.entityManager.find(
                FileUpload,
                {
                    expiresAt: { $lt: new Date() },
                },
                {
                    limit,
                    offset: 0,
                },
            );

            for (const file of files) {
                await this.delete(file);
            }
            hasMore = files.length === limit;
        } while (hasMore);
        await this.entityManager.flush();
    }
}
