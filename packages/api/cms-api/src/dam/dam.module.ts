import { DynamicModule, Global, Module, Type } from "@nestjs/common";

import { DamConfig, damDefaultBasePath } from "./dam.config";
import { DamBlocksModule } from "./dam-blocks.module";
import { DamDependentsModule } from "./dam-dependents.module";
import { DamFilesModule } from "./dam-files.module";
import { DamImagesModule } from "./dam-images.module";
import { createFileEntity, FileInterface } from "./files/entities/file.entity";
import { createFolderEntity, FolderInterface } from "./files/entities/folder.entity";
import { DamScopeInterface } from "./types";

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
