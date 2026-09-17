import type { EntityClass } from "@mikro-orm/postgresql";

import { resolveEntityClass } from "../../../mikro-orm/helper/resolve-entity-class";
import type { FileInterface } from "./file.entity";
import type { FolderInterface } from "./folder.entity";

const FILE_ENTITY_NAME = "DamFile";
const FOLDER_ENTITY_NAME = "DamFolder";

/** Resolves the concrete DAM file entity created by `createFileEntity()`. */
export function resolveFileEntity(): EntityClass<FileInterface> {
    return resolveEntityClass<FileInterface>(FILE_ENTITY_NAME);
}

/** Resolves the concrete DAM folder entity created by `createFolderEntity()`. */
export function resolveFolderEntity(): EntityClass<FolderInterface> {
    return resolveEntityClass<FolderInterface>(FOLDER_ENTITY_NAME);
}
