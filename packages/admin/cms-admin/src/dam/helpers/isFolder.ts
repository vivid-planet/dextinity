import type { GQLDamFileTableFragment, GQLDamFolderTableFragment } from "../DataGrid/FolderDataGrid";

export const isFolder = (item: GQLDamFileTableFragment | GQLDamFolderTableFragment): item is GQLDamFolderTableFragment =>
    item.__typename === "DamFolder";
