import type { EntityClass } from "@mikro-orm/postgresql";

import { resolveEntityClass } from "../../../mikro-orm/helper/resolve-entity-class.js";
import type { FileInterface } from "./file.entity.js";
import type { FolderInterface } from "./folder.entity.js";

const FILE_ENTITY_NAME = "DamFile";
const FOLDER_ENTITY_NAME = "DamFolder";

export function resolveFileEntity(): EntityClass<FileInterface> {
    return resolveEntityClass<FileInterface>(FILE_ENTITY_NAME);
}

export function resolveFolderEntity(): EntityClass<FolderInterface> {
    return resolveEntityClass<FolderInterface>(FOLDER_ENTITY_NAME);
}
