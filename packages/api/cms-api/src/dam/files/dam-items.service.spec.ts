import { describe, expect, it, vi } from "vitest";

import { SortDirection } from "../../common/sorting/sort-direction.enum";
import { DamItemsService } from "./dam-items.service";
import { DamItemType } from "./dto/dam-items.args";
import type { FilesService } from "./files.service";
import type { FoldersService } from "./folders.service";

const FOLDER_ID = "11111111-1111-1111-1111-111111111111";
const FILE_ID = "22222222-2222-2222-2222-222222222222";

function createService() {
    const foldersService = {
        findAndCount: vi.fn().mockResolvedValue([[], 0]),
        getFolderPosition: vi.fn().mockResolvedValue(0),
    };
    const filesService = {
        findAndCount: vi.fn().mockResolvedValue([[], 0]),
        getFilePosition: vi.fn().mockResolvedValue(0),
    };

    const service = new DamItemsService(foldersService as unknown as FoldersService, filesService as unknown as FilesService);

    return { service, foldersService, filesService };
}

describe("DamItemsService", () => {
    it("sorts the list by name when no sort column is given", async () => {
        const { service, foldersService, filesService } = createService();

        await service.findAndCount({ offset: 0, limit: 20, sortDirection: SortDirection.ASC });

        expect(foldersService.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ sortColumnName: "name" }), undefined);
        expect(filesService.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ sortColumnName: "name" }), undefined);
    });

    it("calculates the folder position sorted by name when no sort column is given", async () => {
        const { service, foldersService } = createService();

        await service.getDamItemPosition({ id: FOLDER_ID, type: DamItemType.Folder, sortDirection: SortDirection.ASC });

        expect(foldersService.getFolderPosition).toHaveBeenCalledWith(FOLDER_ID, expect.objectContaining({ sortColumnName: "name" }), undefined);
    });

    it("calculates the file position sorted by name when no sort column is given", async () => {
        const { service, foldersService, filesService } = createService();

        await service.getDamItemPosition({ id: FILE_ID, type: DamItemType.File, sortDirection: SortDirection.ASC });

        expect(foldersService.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ sortColumnName: "name" }), undefined);
        expect(filesService.getFilePosition).toHaveBeenCalledWith(FILE_ID, expect.objectContaining({ sortColumnName: "name" }), undefined);
    });

    it("keeps the given sort column", async () => {
        const { service, filesService } = createService();

        await service.getDamItemPosition({ id: FILE_ID, type: DamItemType.File, sortColumnName: "size", sortDirection: SortDirection.DESC });

        expect(filesService.getFilePosition).toHaveBeenCalledWith(
            FILE_ID,
            expect.objectContaining({ sortColumnName: "size", sortDirection: SortDirection.DESC }),
            undefined,
        );
    });
});
