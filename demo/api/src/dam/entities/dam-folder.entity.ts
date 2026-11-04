import { createFolderEntity } from "@dextinity/cms-api";

import { DamScope } from "../dto/dam-scope";

export const DamFolder = createFolderEntity({ Scope: DamScope });
