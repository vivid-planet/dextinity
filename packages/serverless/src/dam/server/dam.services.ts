import type { BlobStorage, Database, ImageTransformer, ScopeColumns } from "../../core/server/index.js";
import type { ResolvedDamConfig } from "./dam.config.js";
import type { DamSchema } from "./db/dam.schema.js";
import { FilesService } from "./files/files.service.js";
import { FoldersService } from "./folders/folders.service.js";
import { ImagesService } from "./images/images.service.js";
import { DamItemsService } from "./items/dam-items.service.js";

export interface DamServiceDependencies {
    database: Database;
    blobStorage: BlobStorage;
    imageTransformer: ImageTransformer;
    config: ResolvedDamConfig;
    schema: DamSchema;
    scopeColumns: ScopeColumns;
}

export interface DamServices {
    files: FilesService;
    folders: FoldersService;
    items: DamItemsService;
    images: ImagesService;
}

/**
 * The counterpart of the providers of `DamModule`. Services reference each other through the container, which replaces NestJS's
 * `forwardRef` for the circular dependency between files and folders.
 */
export function createDamServices(dependencies: DamServiceDependencies): DamServices {
    const services = {} as DamServices;
    services.files = new FilesService(dependencies, services);
    services.folders = new FoldersService(dependencies, services);
    services.items = new DamItemsService(services);
    services.images = new ImagesService(dependencies);
    return services;
}
