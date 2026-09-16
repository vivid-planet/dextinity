import { Injectable } from "@nestjs/common";

import { ScopeInterface } from "../../user-permissions/interfaces/scope.interface";
import { DamItemInterface } from "./dam-items.resolver";
import { DamItemPositionArgsInterface, DamItemsArgsInterface, DamItemType } from "./dto/dam-items.args";
import { FilesService } from "./files.service";
import { FoldersService } from "./folders.service";

@Injectable()
export class DamItemsService {
    constructor(
        private readonly foldersService: FoldersService,
        private readonly filesService: FilesService,
    ) {}

    async findAndCount(
        { folderId, includeArchived, filter, sortColumnName, sortDirection, offset, limit }: Omit<DamItemsArgsInterface, "scope">,
        scope?: ScopeInterface,
    ): Promise<[DamItemInterface[], number]> {
        const [folders, foldersTotalCount] = await this.foldersService.findAndCount(
            {
                parentId: folderId,
                includeArchived,
                filter: { searchText: filter?.searchText },
                sortDirection,
                sortColumnName,
                offset,
                limit,
            },
            scope,
        );

        const remainingLimit = limit - folders.length;
        const filesOffset = offset - foldersTotalCount > 0 ? offset - foldersTotalCount : 0;

        const [files, filesTotalCount] = await this.filesService.findAndCount(
            {
                folderId,
                includeArchived,
                filter: { searchText: filter?.searchText, mimetypes: filter?.mimetypes },
                sortColumnName,
                sortDirection,
                offset: filesOffset,
                limit: remainingLimit,
            },
            scope,
        );

        const response: DamItemInterface[] = [...folders];

        if (remainingLimit > 0) {
            response.push(...files);
        }

        return [response, foldersTotalCount + filesTotalCount];
    }

    async getDamItemPosition({ type, id, ...args }: Omit<DamItemPositionArgsInterface, "scope">, scope?: ScopeInterface): Promise<number> {
        if (type === DamItemType.Folder) {
            const folderPosition = await this.foldersService.getFolderPosition(
                id,
                {
                    parentId: args.folderId,
                    includeArchived: args.includeArchived,
                    filter: { searchText: args.filter?.searchText },
                    sortDirection: args.sortDirection,
                    sortColumnName: args.sortColumnName,
                },
                scope,
            );

            return folderPosition;
        }

        const [, foldersTotalCount] = await this.foldersService.findAndCount(
            {
                parentId: args.folderId,
                includeArchived: args.includeArchived,
                filter: { searchText: args.filter?.searchText },
                sortDirection: args.sortDirection,
                sortColumnName: args.sortColumnName,
                // offset and limit do not matter here
                offset: 0,
                limit: 10,
            },
            scope,
        );

        const filePosition = await this.filesService.getFilePosition(
            id,
            {
                folderId: args.folderId,
                includeArchived: args.includeArchived,
                filter: args.filter,
                sortDirection: args.sortDirection,
                sortColumnName: args.sortColumnName,
            },
            scope,
        );

        return foldersTotalCount + filePosition;
    }
}
