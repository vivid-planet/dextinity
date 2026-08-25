import { MikroOrmModule } from "@mikro-orm/nestjs";
import { DynamicModule, Global, Module, Type, ValueProvider } from "@nestjs/common";
import { TypeMetadataStorage } from "@nestjs/graphql";

import { FileValidationService } from "../file-utils/file-validation.service";
import { HasValidFilenameConstraint } from "./common/decorators/has-valid-filename.decorator";
import { damDefaultAcceptedMimetypes } from "./common/mimeTypes/dam-default-accepted-mimetypes";
import { DamConfig, damDefaultBasePath } from "./dam.config";
import { DAM_CONFIG, DAM_DISABLE_SCOPE_ACCESS_CONTROL, DAM_FILE_VALIDATION_SERVICE } from "./dam.constants";
import { createDamItemsResolver } from "./files/dam-items.resolver";
import { DamItemsService } from "./files/dam-items.service";
import { createDamMediaAlternativeResolver } from "./files/dam-media-alternatives/dam-media-alternative.resolver";
import { DamMediaAlternative } from "./files/dam-media-alternatives/entities/dam-media-alternative.entity";
import { FILE_ENTITY, FileInterface } from "./files/entities/file.entity";
import { DamFileImage } from "./files/entities/file-image.entity";
import { FolderInterface } from "./files/entities/folder.entity";
import { FileLicensesResolver } from "./files/file-licenses.resolver";
import { FileWarningService } from "./files/file-warning.service";
import { createFilesController } from "./files/files.controller";
import { createFilesResolver } from "./files/files.resolver";
import { FilesService } from "./files/files.service";
import { createFoldersController } from "./files/folders.controller";
import { createFoldersResolver } from "./files/folders.resolver";
import { FoldersService } from "./files/folders.service";
import { ImageCropArea } from "./images/entities/image-crop-area.entity";
import { DamScopeAccessControlService } from "./scope-access-control.service";
import { DamScopeInterface } from "./types";

interface DamFilesModuleOptions {
    damConfig: Omit<DamConfig, "basePath"> & { basePath?: string };
    Scope?: Type<DamScopeInterface>;
    Folder: Type<FolderInterface>;
    File: Type<FileInterface>;
    /**
     * Disables the scope-based access control checks in the DAM controllers.
     *
     * By default the controllers use the `AccessControlService` provided by `UserPermissionsModule`, and deny access when none is
     * available. Set to `true` only when running the DAM without `UserPermissionsModule`, behind your own authentication guard —
     * the DAM will then skip its own scope checks.
     */
    disableScopeAccessControl?: boolean;
}

@Global()
@Module({})
export class DamFilesModule {
    private static registered = false;

    static register({ damConfig: damConfigOptions, Scope, Folder, File, disableScopeAccessControl = false }: DamFilesModuleOptions): DynamicModule {
        // The module is global and declares the DAM file and folder routes. DamModule registers it internally, so registering
        // both would mount those routes twice.
        if (DamFilesModule.registered) {
            throw new Error(
                "DamFilesModule has already been registered. It is registered by DamModule, so register either DamModule or DamFilesModule, not both.",
            );
        }
        DamFilesModule.registered = true;

        if (File.name !== FILE_ENTITY) {
            throw new Error(`DamModule: Your File entity must be named ${FILE_ENTITY}`);
        }

        const damConfig: DamConfig = {
            ...damConfigOptions,
            basePath: damConfigOptions.basePath ?? damDefaultBasePath,
        };

        const damConfigProvider: ValueProvider<DamConfig> = {
            provide: DAM_CONFIG,
            useValue: damConfig,
        };

        const disableScopeAccessControlProvider: ValueProvider<boolean> = {
            provide: DAM_DISABLE_SCOPE_ACCESS_CONTROL,
            useValue: disableScopeAccessControl,
        };

        const fileValidationServiceProvider = {
            provide: DAM_FILE_VALIDATION_SERVICE,
            useValue: new FileValidationService({
                maxFileSize: damConfig.maxFileSize,
                acceptedMimeTypes: damConfig.acceptedMimeTypes ?? damDefaultAcceptedMimetypes,
            }),
        };

        const DamItemsResolver = createDamItemsResolver({ File, Folder, Scope });
        const FilesResolver = createFilesResolver({ File, Folder, Scope });
        const FoldersResolver = createFoldersResolver({ Folder, Scope });
        const DamMediaAlternativeResolver = createDamMediaAlternativeResolver({ File, Scope });

        if (Scope) {
            // Scope validation needs to happen after resolver generation. Otherwise the input type metadata has not been defined yet.
            const scopeObjectType = TypeMetadataStorage.getObjectTypeMetadataByTarget(Scope);

            if (scopeObjectType?.name !== "DamScope") {
                throw new Error(
                    `Invalid object type name for provided DAM scope class. Make sure to decorate the class with @ObjectType("DamScope")`,
                );
            }

            const scopeInputType = TypeMetadataStorage.getInputTypeMetadataByTarget(Scope);

            if (scopeInputType?.name !== "DamScopeInput") {
                throw new Error(
                    `Invalid input type name for provided DAM scope class. Make sure to decorate the class with @InputType("DamScopeInput")`,
                );
            }
        }

        return {
            module: DamFilesModule,
            imports: [MikroOrmModule.forFeature([File, Folder, DamFileImage, ImageCropArea, DamMediaAlternative])],
            providers: [
                damConfigProvider,
                disableScopeAccessControlProvider,
                fileValidationServiceProvider,
                DamItemsResolver,
                DamItemsService,
                FilesResolver,
                FilesService,
                FileLicensesResolver,
                FoldersResolver,
                FoldersService,
                HasValidFilenameConstraint,
                FileWarningService,
                DamMediaAlternativeResolver,
                DamScopeAccessControlService,
            ],
            controllers: [
                createFilesController({ Scope, damBasePath: damConfig.basePath }),
                createFoldersController({ damBasePath: damConfig.basePath }),
            ],
            exports: [FilesService, FoldersService, DamItemsService, damConfigProvider, DamScopeAccessControlService],
        };
    }
}
