import { createFolderEntity } from "@dextinity/cms-api";

import { DamScope } from "../dto/dam-scope.js";

export const DamFolder = createFolderEntity({ Scope: DamScope });
