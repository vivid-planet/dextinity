import { type ContentScope, CorePermission, type FileInterface, FilesService, SortDirection } from "@dextinity/cms-api";
import { Payload } from "@nestjs/microservices";
import { McpController, McpRawRequest, Tool } from "@rekog/mcp-nest";
import { AccessControlService } from "@src/auth/access-control.service.js";
import { z } from "zod";

import { damScopeSchema, errorResult, getSignedInUser, jsonResult, type McpRequest, notSignedInResult } from "./mcp-tool.utils.js";

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

@McpController()
export class DamTools {
    constructor(
        private readonly filesService: FilesService,
        private readonly accessControlService: AccessControlService,
    ) {}

    @Tool({
        name: "list_dam_files",
        description: `List files in the Digital Asset Management (DAM) system.
Returns an array of files with id, name, mimetype, size, fileUrl, title, altText, and image metadata.
Use the returned file IDs as damFileId when constructing image blocks such as PixelImage or SvgImage.

Without a folder ID, lists the files at the top level of the DAM; a search covers all folders.
Optional: filter by mimetype (e.g. "image/jpeg"), search by filename, or list files in a specific folder.`,
        parameters: listDamFilesParameters,
        annotations: { readOnlyHint: true },
    })
    async listDamFiles(
        @Payload() { scope, folderId, filter, limit, offset, sortColumnName, sortDirection }: z.infer<typeof listDamFilesParameters>,
        @McpRawRequest() request: McpRequest,
    ) {
        const user = getSignedInUser(request);
        if (!user) {
            return notSignedInResult;
        }
        // As `@RequiredPermission("dam")` checks the scope argument of the `damFilesList` query. The DAM scope has
        // fewer dimensions than a content scope, and the check compares only the dimensions it is given.
        if (!this.accessControlService.isAllowed(user, CorePermission.dam, scope as ContentScope)) {
            return errorResult("You may not read the DAM of this scope.");
        }

        const [files, totalCount] = await this.filesService.findAndCount(
            { folderId, filter, limit, offset, ...(sortColumnName && { sortColumnName }), sortDirection },
            scope,
        );

        return jsonResult({ nodes: await Promise.all(files.map((file) => this.toDamFile(file))), totalCount });
    }

    @Tool({
        name: "get_dam_file",
        description: `Get a single DAM file by ID. Returns full file metadata including image dimensions, crop area, and file URL.`,
        parameters: getDamFileParameters,
        annotations: { readOnlyHint: true },
    })
    async getDamFile(@Payload() { id }: z.infer<typeof getDamFileParameters>, @McpRawRequest() request: McpRequest) {
        const user = getSignedInUser(request);
        if (!user) {
            return notSignedInResult;
        }
        const file = await this.filesService.findOneById(id);
        // As `@AffectedEntity(File)` checks the scope of the file, with the same answer for a file the user may not
        // read as for one that doesn't exist.
        if (!file?.scope || !this.accessControlService.isAllowed(user, CorePermission.dam, { ...file.scope } as ContentScope)) {
            return errorResult(`There is no DAM file ${id}.`);
        }

        return jsonResult({ ...(await this.toDamFile(file)), damPath: await this.filesService.getDamPath(file) });
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
