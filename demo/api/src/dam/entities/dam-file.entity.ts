import { createFileEntity } from "@dextinity/cms-api";

import { DamScope } from "../dto/dam-scope";
import { DamFolder } from "./dam-folder.entity";

export const DamFile = createFileEntity({ Scope: DamScope, Folder: DamFolder });
export type DamFile = InstanceType<typeof DamFile>;
