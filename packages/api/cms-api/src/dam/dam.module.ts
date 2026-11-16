import { type DynamicModule, Global, Module, type Type } from "@nestjs/common";

import { type DamConfig, damDefaultBasePath } from "./dam.config.js";
import { DamBlocksModule } from "./dam-blocks.module.js";
import { DamDependentsModule } from "./dam-dependents.module.js";
import { DamFilesModule } from "./dam-files.module.js";
import { DamImagesModule } from "./dam-images.module.js";
import { createFileEntity, type FileInterface } from "./files/entities/file.entity.js";
import { createFolderEntity, type FolderInterface } from "./files/entities/folder.entity.js";
import type { DamScopeInterface } from "./types.js";

interface DamModuleOptions {
    damConfig: Omit<DamConfig, "basePath"> & { basePath?: string };
    Scope?: Type<DamScopeInterface>;
    Folder?: Type<FolderInterface>;
    File?: Type<FileInterface>;
}

@Global()
@Module({})
export class DamModule {
    private static registered = false;

    static register({
        Scope,
        Folder = createFolderEntity({ Scope }),
        File = createFileEntity({ Scope, Folder }),
        ...options
    }: DamModuleOptions): DynamicModule {
        if (DamModule.registered) {
            throw new Error("DamModule has already been registered. Make sure to register it only once in your application.");
        }
        DamModule.registered = true;

        const damConfig = {
            ...options.damConfig,
            basePath: options.damConfig.basePath ?? damDefaultBasePath,
        };

        return {
            module: DamModule,
            imports: [
                DamFilesModule.register({ damConfig, Scope, Folder, File }),
                DamDependentsModule.register({ File }),
                DamImagesModule.register({ damBasePath: damConfig.basePath }),
                DamBlocksModule.register(),
            ],
            exports: [DamFilesModule, DamImagesModule, DamBlocksModule],
        };
    }
}
