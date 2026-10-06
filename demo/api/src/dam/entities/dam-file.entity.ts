import { createFileEntity } from "@dextinity/cms-api";

import { DamScope } from "../dto/dam-scope.js";
import { DamFolder } from "./dam-folder.entity.js";

export const DamFile = createFileEntity({ Scope: DamScope, Folder: DamFolder });
export type DamFile = InstanceType<typeof DamFile>;
