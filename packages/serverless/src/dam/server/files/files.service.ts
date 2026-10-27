import { createHash, createHmac } from "node:crypto";
import { basename, extname } from "node:path";

import { and, asc, desc, eq, inArray, isNull, ne, or, type SQL, sql } from "drizzle-orm";
import slugify from "slugify";

import { badRequest, createHashedPath, notFound, unprocessableEntity } from "../../../core/server/index.js";
import { getDamFileCategory } from "../common/dam-file-category.js";
import { containsIgnoringCase } from "../common/sql.util.js";
import type { DamScopeFilter } from "../dam.context.js";
import type { PaginationArgs, SortArgs, UpdateFileInput, UploadFileAssignData } from "../dam.dto.js";
import type { DamServiceDependencies, DamServices } from "../dam.services.js";
import type { DamFile, DamFolder, ImageCropArea } from "../dam.types.js";
import type { DamScope } from "../db/dam.schema.js";
import type { UploadedFile } from "./file-validation.js";

const exifrSupportedMimetypes = ["image/jpeg", "image/tiff", "image/x-iiq", "image/heif", "image/heic", "image/avif", "image/png"];
/** The formats the image transformer renders, other images are stored as files only */
const transformableImageMimetypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];

export interface FileListArgs extends SortArgs {
    folderId?: string;
    includeArchived?: boolean;
    searchText?: string;
    mimetypes?: string[];
    ids?: string[];
    scopeFilter?: DamScopeFilter;
}

const toStream = (bytes: Uint8Array<ArrayBuffer>) => new Blob([bytes]).stream();

function slugifyFilename(filename: string, extension: string): string {
    const extensionWithDot = extension.startsWith(".") ? extension : `.${extension}`;
    return `${slugify(filename)}${extensionWithDot}`;
}

export class FilesService {
    constructor(
        private readonly deps: DamServiceDependencies,
        private readonly services: DamServices,
    ) {}

    private get db() {
        return this.deps.database.drizzle;
    }

    async findOneById(id: string): Promise<DamFile | null> {
        const [file] = await this.select(eq(this.deps.schema.damFiles.id, id));
        return file ?? null;
    }

    async findAllByIds(ids: string[]): Promise<DamFile[]> {
        return ids.length > 0 ? this.select(inArray(this.deps.schema.damFiles.id, ids)) : [];
    }

    async findAll(args: FileListArgs, scope?: DamScope): Promise<DamFile[]> {
        return this.select(this.listConditions(args, scope), { orderBy: this.orderBy(args) });
    }

    async findAndCount(args: FileListArgs & PaginationArgs, scope: DamScope | undefined): Promise<[DamFile[], number]> {
        const where = this.listConditions(args, scope);
        const files = await this.select(where, { orderBy: this.orderBy(args), offset: args.offset, limit: args.limit });
        return [files, await this.db.$count(this.deps.schema.damFiles, where)];
    }

    async findAllByHash(contentHash: string, scope?: DamScope): Promise<DamFile[]> {
        const { damFiles } = this.deps.schema;
        return this.select(and(eq(damFiles.contentHash, contentHash), this.deps.scopeColumns.equals(damFiles, scope)));
    }

    async findOneByFilenameAndFolder({ filename, folderId }: { filename: string; folderId: string | null }, scope: DamScope | undefined) {
        const { damFiles } = this.deps.schema;
        const [file] = await this.select(
            and(
                eq(damFiles.name, filename),
                folderId ? eq(damFiles.folderId, folderId) : isNull(damFiles.folderId),
                this.deps.scopeColumns.equals(damFiles, scope),
            ),
        );
        return file ?? null;
    }

    async isFilenameOccupied({ filename, folderId }: { filename: string; folderId: string | null }, scope: DamScope | undefined): Promise<boolean> {
        const extension = extname(filename);
        const slugifiedName = slugifyFilename(basename(filename, extension), extension);
        return (await this.findOneByFilenameAndFolder({ filename: slugifiedName, folderId }, scope)) !== null;
    }

    async getDamPath(file: DamFile): Promise<string> {
        const folders = file.folder ? await this.services.folders.findAncestorsAndSelf(file.folder.id) : [];
        return `/${folders.map((folder) => folder.name).join("/")}`;
    }

    async upload(
        file: UploadedFile,
        { folderId, scope, imageCropArea, license, ...assignData }: UploadFileAssignData & { folderId?: string; scope: DamScope | undefined },
    ): Promise<DamFile> {
        const { damFiles, damFileImages } = this.deps.schema;
        const { contentHash, image, exif, dominantColor } = await this.getFileMetadata(file);
        await this.storeInBlobStorage(file, contentHash);

        const name = await this.findNextAvailableFilename({ filePath: file.name, folderId: folderId ?? null, scope });
        const id = crypto.randomUUID();
        const imageId = image ? crypto.randomUUID() : null;

        await this.deps.database.batch((db) => [
            ...(image && imageId
                ? [
                      db.insert(damFileImages).values({
                          id: imageId,
                          width: image.width,
                          height: image.height,
                          exif,
                          dominantColor,
                          ...this.cropAreaValues(imageCropArea ?? { focalPoint: "SMART" }),
                      }),
                  ]
                : []),
            db.insert(damFiles).values({
                id,
                name,
                folderId: folderId ?? null,
                size: file.size,
                mimetype: file.type,
                contentHash,
                imageId,
                ...assignData,
                ...this.licenseValues(license),
                ...this.deps.scopeColumns.toValues(scope),
            }),
        ]);

        return (await this.findOneById(id)) as DamFile;
    }

    async replace(fileToReplace: DamFile, file: UploadedFile, { imageCropArea, license, ...assignData }: UploadFileAssignData): Promise<DamFile> {
        const { damFiles, damFileImages } = this.deps.schema;
        const existingCategory = getDamFileCategory(fileToReplace.mimetype);
        const uploadedCategory = getDamFileCategory(file.type);

        if (existingCategory === "document") {
            // Files in the "document" category serve varying purposes: a VTT file is a video's subtitles, a PDF is a download.
            if (file.type !== fileToReplace.mimetype) {
                throw badRequest(
                    `File cannot be replaced by a file of a different mimetype. Existing mimetype: ${fileToReplace.mimetype}, new mimetype: ${file.type}`,
                );
            }
        } else if (uploadedCategory !== existingCategory) {
            throw badRequest(
                `File cannot be replaced by a file of a different category. Existing category: ${existingCategory} (${fileToReplace.mimetype}), new category: ${uploadedCategory} (${file.type})`,
            );
        }

        const name = await this.getNameForReplacedFile(fileToReplace, file);
        const { contentHash, image, exif, dominantColor } = await this.getFileMetadata(file);

        if (fileToReplace.contentHash !== contentHash) {
            await this.storeInBlobStorage(file, contentHash);
            await this.removeFromBlobStorageIfUnused(fileToReplace.contentHash, { except: fileToReplace.id });
        }

        await this.deps.database.batch((db) => [
            ...(fileToReplace.image && image
                ? [
                      db
                          .update(damFileImages)
                          .set({
                              width: image.width,
                              height: image.height,
                              exif,
                              dominantColor,
                              ...(imageCropArea ? this.cropAreaValues(imageCropArea) : {}),
                          })
                          .where(eq(damFileImages.id, fileToReplace.image.id)),
                  ]
                : []),
            db
                .update(damFiles)
                .set({ name, size: file.size, mimetype: file.type, contentHash, ...assignData, ...(license ? this.licenseValues(license) : {}) })
                .where(eq(damFiles.id, fileToReplace.id)),
        ]);

        return (await this.findOneById(fileToReplace.id)) as DamFile;
    }

    async update(file: DamFile, { image, license, folderId: inputFolderId, ...input }: UpdateFileInput): Promise<DamFile> {
        const { damFiles, damFileImages } = this.deps.schema;
        const folderId = inputFolderId !== undefined ? inputFolderId : (file.folder?.id ?? null);

        if (input.name) {
            const fileWithSameName = await this.findOneByFilenameAndFolder({ filename: input.name, folderId }, file.scope);
            if (fileWithSameName !== null && fileWithSameName.id !== file.id) {
                throw badRequest(`File with name '${input.name}' already exists in this folder`);
            }
        }

        await this.deps.database.batch((db) => [
            ...(file.image && image?.cropArea
                ? [db.update(damFileImages).set(this.cropAreaValues(image.cropArea)).where(eq(damFileImages.id, file.image.id))]
                : []),
            db
                .update(damFiles)
                .set({ ...input, folderId, ...(license ? this.licenseValues(license) : {}) })
                .where(eq(damFiles.id, file.id)),
        ]);

        return (await this.findOneById(file.id)) as DamFile;
    }

    async moveBatch(files: DamFile[], targetFolder: DamFolder | null): Promise<DamFile[]> {
        const moved: DamFile[] = [];
        for (const file of files) {
            moved.push(await this.update(file, { folderId: targetFolder?.id ?? null }));
        }
        return moved;
    }

    async setArchived(files: DamFile[], archived: boolean): Promise<DamFile[]> {
        const { damFiles } = this.deps.schema;
        await this.db
            .update(damFiles)
            .set({ archived })
            .where(
                inArray(
                    damFiles.id,
                    files.map((file) => file.id),
                ),
            );
        return this.findAllByIds(files.map((file) => file.id));
    }

    async delete(file: DamFile): Promise<boolean> {
        const { damFiles, damFileImages } = this.deps.schema;
        if (!(await this.findOneById(file.id))) {
            return false;
        }
        await this.deps.database.batch((db) => [
            db.delete(damFiles).where(eq(damFiles.id, file.id)),
            ...(file.image ? [db.delete(damFileImages).where(eq(damFileImages.id, file.image.id))] : []),
        ]);
        await this.removeFromBlobStorageIfUnused(file.contentHash);
        return true;
    }

    async getFilePosition(fileId: string, args: FileListArgs, scope: DamScope | undefined): Promise<number> {
        const { damFiles } = this.deps.schema;
        const rows = this.db
            .select({
                id: damFiles.id,
                rowNumber:
                    sql<number>`row_number() over (order by ${damFiles[args.sortColumnName ?? "name"]} ${sql.raw(args.sortDirection ?? "ASC")})`.as(
                        "row_number",
                    ),
            })
            .from(damFiles)
            .where(this.listConditions({ ...args, ids: undefined }, scope))
            .as("file_with_row_number");

        const [row] = await this.db.select({ rowNumber: rows.rowNumber }).from(rows).where(eq(rows.id, fileId));
        if (!row) {
            throw notFound("File ID does not exist.");
        }
        // Make the positions start with 0
        return Number(row.rowNumber) - 1;
    }

    createHash({ fileId, filename }: { fileId: string; filename: string }): string {
        return createHmac("sha1", this.deps.config.secret).update(`file:${fileId}:${filename}`).digest("hex");
    }

    createFileUrl(file: DamFile, { previewDamUrls = false }: { previewDamUrls?: boolean } = {}): string {
        return this.createUrl(file, `/${this.deps.config.basePath}/files`, previewDamUrls);
    }

    createFileDownloadUrl(file: DamFile, { previewDamUrls = false }: { previewDamUrls?: boolean } = {}): string {
        return this.createUrl(file, `/${this.deps.config.basePath}/files/download`, previewDamUrls);
    }

    async findNextAvailableFilename({ filePath, folderId, scope }: { filePath: string; folderId: string | null; scope: DamScope | undefined }) {
        const extension = extname(filePath);
        const filename = basename(filePath, extension);

        let i = 1;
        let name = slugifyFilename(filename, extension);
        while ((await this.findOneByFilenameAndFolder({ filename: name, folderId }, scope)) !== null) {
            name = slugifyFilename(`${filename}-copy${i}`, extension);
            i++;
        }
        return name;
    }

    private createUrl(file: DamFile, baseUrl: string, previewDamUrls: boolean): string {
        const hashOrPreview = previewDamUrls ? "preview" : this.createHash({ fileId: file.id, filename: file.name });
        return [baseUrl, hashOrPreview, file.contentHash, file.id, file.name].join("/");
    }

    private async getNameForReplacedFile(fileToReplace: DamFile, file: UploadedFile): Promise<string> {
        const previousExtension = extname(fileToReplace.name);
        const newExtension = extname(file.name).toLowerCase();
        if (newExtension === previousExtension.toLowerCase()) {
            return fileToReplace.name;
        }

        // The name of the file to replace is already slugified, so only the extension needs to be swapped
        const nameWithoutExtension = basename(fileToReplace.name, previousExtension);
        const folderId = fileToReplace.folder?.id ?? null;

        let name = `${nameWithoutExtension}${newExtension}`;
        let counter = 1;
        while ((await this.findOneByFilenameAndFolder({ filename: name, folderId }, fileToReplace.scope)) !== null) {
            counter++;
            name = `${nameWithoutExtension}-${counter}${newExtension}`;
        }
        return name;
    }

    private async storeInBlobStorage(file: UploadedFile, contentHash: string): Promise<void> {
        const { blobStorage, config } = this.deps;
        const fileName = createHashedPath(contentHash);
        if (!(await blobStorage.fileExists(config.filesDirectory, fileName))) {
            await blobStorage.createFile(config.filesDirectory, fileName, file.bytes, { contentType: file.type });
        }
    }

    private async removeFromBlobStorageIfUnused(contentHash: string, { except }: { except?: string } = {}): Promise<void> {
        const { damFiles } = this.deps.schema;
        const usages = await this.db.$count(damFiles, and(eq(damFiles.contentHash, contentHash), except ? ne(damFiles.id, except) : undefined));
        if (usages === 0) {
            await this.deps.blobStorage.removeFile(this.deps.config.filesDirectory, createHashedPath(contentHash));
        }
    }

    private async getFileMetadata(file: UploadedFile): Promise<{
        contentHash: string;
        image: { width: number; height: number } | undefined;
        exif: Record<string, unknown> | undefined;
        dominantColor: string | undefined;
    }> {
        const contentHash = createHash("md5").update(file.bytes).digest("hex");
        if (!transformableImageMimetypes.includes(file.type)) {
            return { contentHash, image: undefined, exif: undefined, dominantColor: undefined };
        }

        const { imageTransformer, config } = this.deps;
        const info = await imageTransformer.info(toStream(file.bytes));
        if (!("width" in info)) {
            return { contentHash, image: undefined, exif: undefined, dominantColor: undefined };
        }

        let exif: Record<string, unknown> | undefined;
        let orientation: number | undefined;
        if (exifrSupportedMimetypes.includes(file.type)) {
            try {
                const { default: exifr } = await import("exifr");
                exif = await exifr.parse(file.bytes);
                orientation = await exifr.orientation(file.bytes);
            } catch {
                // No EXIF data
            }
        }

        // EXIF orientations 5 to 8 rotate the image by 90°
        const image =
            orientation !== undefined && orientation >= 5 ? { width: info.height, height: info.width } : { width: info.width, height: info.height };
        if (Math.round(((image.width * image.height) / 1000000) * 10) / 10 >= config.maxSrcResolution) {
            throw unprocessableEntity("Maximal image resolution exceeded");
        }

        return { contentHash, image, exif, dominantColor: await imageTransformer.averageColor(toStream(file.bytes)) };
    }

    private cropAreaValues(cropArea: ImageCropArea) {
        return {
            cropAreaFocalPoint: cropArea.focalPoint,
            cropAreaWidth: cropArea.width ?? null,
            cropAreaHeight: cropArea.height ?? null,
            cropAreaX: cropArea.x ?? null,
            cropAreaY: cropArea.y ?? null,
        };
    }

    private licenseValues(license: UploadFileAssignData["license"]) {
        return {
            licenseType: license?.type ?? null,
            licenseDetails: license?.details ?? null,
            licenseAuthor: license?.author ?? null,
            licenseDurationFrom: license?.durationFrom ?? null,
            licenseDurationTo: license?.durationTo ?? null,
        };
    }

    private orderBy({ sortColumnName, sortDirection }: SortArgs): SQL[] {
        if (!sortColumnName) {
            return [];
        }
        const direction = sortDirection === "DESC" ? desc : asc;
        return [direction(this.deps.schema.damFiles[sortColumnName]), asc(this.deps.schema.damFiles.id)];
    }

    private listConditions(
        { folderId, includeArchived, searchText, mimetypes, ids, scopeFilter }: FileListArgs,
        scope: DamScope | undefined,
    ): SQL | undefined {
        const { damFiles } = this.deps.schema;
        const isSearching = searchText !== undefined && searchText.length > 0;
        const isFilteringByIds = ids !== undefined && ids.length > 0;
        const ignoreFolder = isSearching || isFilteringByIds;

        return and(
            includeArchived ? undefined : eq(damFiles.archived, false),
            ignoreFolder ? undefined : folderId ? eq(damFiles.folderId, folderId) : isNull(damFiles.folderId),
            mimetypes ? inArray(damFiles.mimetype, mimetypes) : undefined,
            isFilteringByIds ? inArray(damFiles.id, ids) : undefined,
            isSearching ? or(...searchText.split(" ").map((term) => containsIgnoringCase(damFiles.name, term))) : undefined,
            this.deps.scopeColumns.equals(damFiles, scope),
            scopeFilter?.(this.deps.scopeColumns.byDimension(damFiles)),
        );
    }

    private async select(
        where: SQL | undefined,
        { orderBy = [], offset, limit }: { orderBy?: SQL[]; offset?: number; limit?: number } = {},
    ): Promise<DamFile[]> {
        const { damFiles, damFileImages, damFolders } = this.deps.schema;
        const query = this.db
            .select({
                file: damFiles,
                scope: this.deps.scopeColumns.select(damFiles),
                image: damFileImages,
                folder: { id: damFolders.id, name: damFolders.name },
            })
            .from(damFiles)
            .leftJoin(damFileImages, eq(damFiles.imageId, damFileImages.id))
            .leftJoin(damFolders, eq(damFiles.folderId, damFolders.id))
            .where(where)
            .orderBy(...orderBy)
            .$dynamic();

        if (offset !== undefined) {
            query.offset(offset);
        }
        if (limit !== undefined) {
            query.limit(limit);
        }

        return (await query).map(({ file, scope, image, folder }) => ({
            id: file.id,
            folder,
            name: file.name,
            size: file.size,
            mimetype: file.mimetype,
            contentHash: file.contentHash,
            title: file.title,
            altText: file.altText,
            aiContentType: file.aiContentType,
            archived: file.archived,
            image: image && {
                id: image.id,
                width: image.width,
                height: image.height,
                exif: image.exif,
                dominantColor: image.dominantColor,
                cropArea: {
                    focalPoint: image.cropAreaFocalPoint,
                    width: image.cropAreaWidth,
                    height: image.cropAreaHeight,
                    x: image.cropAreaX,
                    y: image.cropAreaY,
                },
            },
            license: {
                type: file.licenseType,
                details: file.licenseDetails,
                author: file.licenseAuthor,
                durationFrom: file.licenseDurationFrom,
                durationTo: file.licenseDurationTo,
            },
            importSourceId: file.importSourceId,
            importSourceType: file.importSourceType,
            copyOfId: file.copyOfId,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            scope: this.deps.scopeColumns.fromRow(scope),
        }));
    }
}
