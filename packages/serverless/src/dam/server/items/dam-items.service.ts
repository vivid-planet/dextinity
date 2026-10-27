import type { DamScopeFilter } from "../dam.context.js";
import type { PaginationArgs, SortArgs } from "../dam.dto.js";
import type { DamServices } from "../dam.services.js";
import type { DamFile, DamFolder } from "../dam.types.js";
import type { DamScope } from "../db/dam.schema.js";

export type DamItem = ({ __typename: "DamFile" } & DamFile) | ({ __typename: "DamFolder" } & DamFolder);

export interface DamItemListArgs extends SortArgs {
    folderId?: string;
    includeArchived?: boolean;
    searchText?: string;
    mimetypes?: string[];
    scopeFilter?: DamScopeFilter;
}

export class DamItemsService {
    constructor(private readonly services: DamServices) {}

    /** Lists folders first, then files, paginated across both. */
    async findAndCount(
        { folderId, searchText, mimetypes, offset, limit, ...args }: DamItemListArgs & PaginationArgs,
        scope: DamScope | undefined,
    ): Promise<[DamItem[], number]> {
        const [folders, foldersTotalCount] = await this.services.folders.findAndCount(
            { ...args, parentId: folderId, searchText, offset, limit },
            scope,
        );

        const remainingLimit = limit - folders.length;
        const filesOffset = Math.max(offset - foldersTotalCount, 0);

        const [files, filesTotalCount] = await this.services.files.findAndCount(
            { ...args, folderId, searchText, mimetypes, offset: filesOffset, limit: Math.max(remainingLimit, 1) },
            scope,
        );

        const items: DamItem[] = folders.map((folder) => ({ __typename: "DamFolder" as const, ...folder }));
        if (remainingLimit > 0) {
            items.push(...files.map((file) => ({ __typename: "DamFile" as const, ...file })));
        }

        return [items, foldersTotalCount + filesTotalCount];
    }

    async getPosition(
        { type, id, ...args }: DamItemListArgs & { type: "File" | "Folder"; id: string },
        scope: DamScope | undefined,
    ): Promise<number> {
        const folderArgs = { ...args, parentId: args.folderId };
        if (type === "Folder") {
            return this.services.folders.getFolderPosition(id, folderArgs, scope);
        }

        const [, foldersTotalCount] = await this.services.folders.findAndCount({ ...folderArgs, offset: 0, limit: 1 }, scope);
        return foldersTotalCount + (await this.services.files.getFilePosition(id, args, scope));
    }
}
