import { AffectedEntity, CorePermission, type FileInterface, FilesService, RequiredPermission, SortDirection } from "@dextinity/cms-api";
import { Injectable, NotFoundException, UseFilters, UseGuards } from "@nestjs/common";
import { Tool } from "@nestjs/mcp";
import { DamFile } from "@src/dam/entities/dam-file.entity.js";
import { z } from "zod";

import { damScopeSchema, NotFoundFilter, RefusalReasonFilter, SignedInUserGuard } from "./mcp-tool.utils.js";

const listDamFilesParameters = z.object({
    scope: damScopeSchema,
    folderId: z.uuid().optional().describe("Filter by folder ID"),
    filter: z
        .object({
            searchText: z.string().optional().describe("Search by filename"),
            mimetypes: z.array(z.string()).optional().describe('Filter by mimetypes, e.g. ["image/jpeg", "image/png"]'),
        })
        .optional()
        .describe("Filter options"),
    limit: z.number().int().min(1).max(100).default(50).describe("Max number of files to return, at most 100"),
    offset: z.number().int().min(0).default(0).describe("Offset for pagination"),
    sortColumnName: z.string().optional().describe("Sort by column name"),
    sortDirection: z.enum(SortDirection).default(SortDirection.ASC).describe("Sort direction"),
});

const getDamFileParameters = z.object({
    id: z.uuid().describe("The DAM file ID"),
});

@Injectable()
@RequiredPermission(CorePermission.dam)
@UseGuards(SignedInUserGuard)
export class DamTools {
    constructor(private readonly filesService: FilesService) {}

    @Tool({
        name: "list_dam_files",
        description: `List files in the Digital Asset Management (DAM) system.
Returns an array of files with id, name, mimetype, size, fileUrl, title, altText, and image metadata.
Use the returned file IDs as damFileId when constructing image blocks such as PixelImage or SvgImage.

Without a folder ID, lists the files at the top level of the DAM; a search covers all folders.
Optional: filter by mimetype (e.g. "image/jpeg"), search by filename, or list files in a specific folder.`,
        inputSchema: listDamFilesParameters,
        annotations: { readOnlyHint: true },
    })
    @UseFilters(new RefusalReasonFilter("You may not read the DAM of this scope."))
    async listDamFiles({ scope, folderId, filter, limit, offset, sortColumnName, sortDirection }: z.infer<typeof listDamFilesParameters>) {
        const [files, totalCount] = await this.filesService.findAndCount(
            { folderId, filter, limit, offset, ...(sortColumnName && { sortColumnName }), sortDirection },
            scope,
        );

        return { nodes: await Promise.all(files.map((file) => this.toDamFile(file))), totalCount };
    }

    @Tool({
        name: "get_dam_file",
        description: `Get a single DAM file by ID. Returns full file metadata including image dimensions, crop area, and file URL.`,
        inputSchema: getDamFileParameters,
        annotations: { readOnlyHint: true },
    })
    @AffectedEntity(DamFile)
    @UseFilters(new NotFoundFilter("DAM file"))
    async getDamFile({ id }: z.infer<typeof getDamFileParameters>) {
        const file = await this.filesService.findOneById(id);
        if (!file) {
            throw new NotFoundException(`There is no DAM file ${id}.`);
        }

        return { ...(await this.toDamFile(file)), damPath: await this.filesService.getDamPath(file) };
    }

    // `fileUrl` is resolved as the `DamFile.fileUrl` field resolver resolves it for a preview request.
    private async toDamFile(file: FileInterface) {
        const previewDamUrls = true;
        const imageToDeliver = file.image ? await this.filesService.findImageToDeliver({ file }, { previewDamUrls }) : null;

        return {
            id: file.id,
            name: file.name,
            size: file.size,
            mimetype: file.mimetype,
            contentHash: file.contentHash,
            title: file.title ?? null,
            altText: file.altText ?? null,
            archived: file.archived,
            fileUrl: await this.filesService.createFileUrl(imageToDeliver?.file ?? file, { previewDamUrls }),
            image: file.image
                ? {
                      width: file.image.width,
                      height: file.image.height,
                      dominantColor: file.image.dominantColor ?? null,
                      cropArea: file.image.cropArea,
                  }
                : null,
            folder: file.folder ? { id: file.folder.id, name: file.folder.name } : null,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
        };
    }
}
