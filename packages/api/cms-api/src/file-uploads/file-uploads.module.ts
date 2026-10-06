import { MikroOrmModule } from "@mikro-orm/nestjs";
import { type DynamicModule, Global, Module, type Provider } from "@nestjs/common";

import { BlobStorageModule } from "../blob-storage/blob-storage.module.js";
import { FileValidationService } from "../file-utils/file-validation.service.js";
import { ImgproxyModule } from "../imgproxy/imgproxy.module.js";
import { FileUpload } from "./entities/file-upload.entity.js";
import { FileUploadExpirationSubscriber } from "./file-upload-expiration.subscriber.js";
import type { FileUploadsConfig } from "./file-uploads.config.js";
import { FILE_UPLOADS_CONFIG, FILE_UPLOADS_FILE_VALIDATION_SERVICE } from "./file-uploads.constants.js";
import { FileUploadsResolver } from "./file-uploads.resolver.js";
import { FileUploadsService } from "./file-uploads.service.js";
import { createFileUploadsDownloadController } from "./file-uploads-download.controller.js";
import { createFileUploadsUploadController } from "./file-uploads-upload.controller.js";

@Global()
@Module({})
export class FileUploadsModule {
    static register(options: FileUploadsConfig): DynamicModule {
        const fileUploadsConfigProvider = {
            provide: FILE_UPLOADS_CONFIG,
            useValue: options,
        };

        const fileUploadsFileValidatorProvider = {
            provide: FILE_UPLOADS_FILE_VALIDATION_SERVICE,
            useValue: new FileValidationService({
                maxFileSize: options.maxFileSize,
                acceptedMimeTypes: options.acceptedMimeTypes,
            }),
        };

        const controllers = [createFileUploadsUploadController(options.upload ?? { public: false })];
        const providers: Provider[] = [
            fileUploadsConfigProvider,
            FileUploadsService,
            fileUploadsFileValidatorProvider,
            FileUploadExpirationSubscriber,
        ];

        if (options.download) {
            if (options.download.secret.length < 16) {
                throw new Error("The download secret must be at least 16 characters long.");
            }

            const FileUploadsDownloadController = createFileUploadsDownloadController({ public: options.download.public ?? false });
            controllers.push(FileUploadsDownloadController);

            const shouldAddResolver = options.download.createFieldResolvers ?? true;

            if (shouldAddResolver) {
                providers.push(FileUploadsResolver);
            }
        }

        return {
            module: FileUploadsModule,
            imports: [MikroOrmModule.forFeature([FileUpload]), BlobStorageModule, ImgproxyModule],
            providers,
            controllers,
            exports: [FileUploadsService],
        };
    }
}
