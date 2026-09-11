import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository, MikroORM, QueryBuilder, raw, Utils } from "@mikro-orm/postgresql";
import { forwardRef, Inject, Injectable, Optional } from "@nestjs/common";
import { createHmac } from "crypto";
import exifr from "exifr";
import { createReadStream } from "fs";
import * as hasha from "hasha";
import { basename, extname, parse } from "path";
import probe from "probe-image-size";
import * as rimraf from "rimraf";

import { BlobStorageBackendService } from "../../blob-storage/backends/blob-storage-backend.service";
import { createHashedPath } from "../../blob-storage/utils/create-hashed-path.util";
import { DextinityEntityNotFoundException } from "../../common/errors/entity-not-found.exception";
import { DextinityValidationException } from "../../common/errors/validation.exception";
import { SortDirection } from "../../common/sorting/sort-direction.enum";
import { FileUploadInput } from "../../file-utils/file-upload.input";
import { slugifyFilename } from "../../file-utils/files.utils";
import { FocalPoint } from "../../file-utils/focal-point.enum";
import { contentScopesAreEqual } from "../../user-permissions/content-scopes-are-equal";
import { DextinityImageResolutionException } from "../common/errors/image-resolution.exception";
import { getDamFileCategory } from "../common/mimeTypes/dam-file-category";
import { DamConfig } from "../dam.config";
import { DAM_CONFIG, DAM_DOMINANT_COLOR_CALCULATOR } from "../dam.constants";
import { DominantColorCalculatorInterface } from "../dominant-color-calculator.interface";
import { ImageCropAreaInput } from "../images/dto/image-crop-area.input";
import { DamScopeInterface } from "../types";
import { DamMediaAlternative } from "./dam-media-alternatives/entities/dam-media-alternative.entity";
import { DamFileListPositionArgs, FileArgsInterface } from "./dto/file.args";
import { UploadFileBodyInterface } from "./dto/file.body";
import { CreateFileInput, ImageFileInput, UpdateFileInput } from "./dto/file.input";
import { FileParams } from "./dto/file.params";
import { FILE_TABLE_NAME, FileInterface } from "./entities/file.entity";
import { DamFileImage } from "./entities/file-image.entity";
import { FolderInterface } from "./entities/folder.entity";
import { FoldersService } from "./folders.service";

const exifrSupportedMimetypes = ["image/jpeg", "image/tiff", "image/x-iiq", "image/heif", "image/heic", "image/avif", "image/png"];

const withFilesSelect = (
    qb: QueryBuilder<FileInterface>,
    args: {
        query?: string;
        id?: string;
        ids?: string[];
        copyOfId?: string;
        filename?: string;
        folderId?: string | null;
        imageId?: string;
        contentHash?: string;
        archived?: boolean;
        mimetypes?: string[];
        sortColumnName?: string;
        sortDirection?: SortDirection;
        offset?: number;
        limit?: number;
        scope?: DamScopeInterface;
        imageCropArea?: ImageCropAreaInput;
    },
): QueryBuilder<FileInterface> => {
    if (args.query) {
        qb.andWhere("file.name ILIKE ANY (ARRAY[?])", [args.query.split(" ").map((term) => `%${term}%`)]);
    }
    if (args.id) {
        qb.andWhere({ id: args.id });
    }
    if (args.ids) {
        qb.andWhere({ id: { $in: args.ids } });
    }
    if (args.copyOfId) {
        qb.andWhere({ copyOf: { id: args.copyOfId } });
    }
    if (args.filename) {
        qb.andWhere({ name: args.filename });
    }
    if (args.contentHash) {
        qb.andWhere({ contentHash: args.contentHash });
    }
    if (args.archived !== undefined) {
        qb.andWhere({ archived: args.archived });
    }
    if (args.folderId !== undefined) {
        if (args.folderId) {
            qb.andWhere({ folder: { id: args.folderId } });
        } else {
            qb.andWhere({ folder: { id: null } });
        }
    }
    if (args.scope !== undefined) {
        qb.andWhere({ scope: args.scope });
    }
    if (args.mimetypes !== undefined) {
        qb.andWhere({ mimetype: { $in: args.mimetypes } });
    }

    if (args.imageId) {
        qb.andWhere({ image: { id: args.imageId } });
    }
    if (args.imageCropArea) {
        qb.andWhere({ image: { cropArea: args.imageCropArea } });
    }

    if (args.sortColumnName && args.sortDirection) {
        qb.orderBy({ [`file.${args.sortColumnName}`]: args.sortDirection });
    }

    if (args.offset) {
        qb.offset(args.offset);
    }
    if (args.limit) {
        qb.limit(args.limit);
    }

    return qb;
};

@Injectable()
export class FilesService {
    constructor(
        @InjectRepository("DamFile") private readonly filesRepository: EntityRepository<FileInterface>,
        @InjectRepository(DamMediaAlternative) private readonly damMediaAlternativesRepository: EntityRepository<DamMediaAlternative>,
        @Inject(forwardRef(() => BlobStorageBackendService)) private readonly blobStorageBackendService: BlobStorageBackendService,
        private readonly foldersService: FoldersService,
        @Inject(DAM_CONFIG) private readonly config: DamConfig,
        private readonly orm: MikroORM,
        private readonly entityManager: EntityManager,
        @Optional() @Inject(DAM_DOMINANT_COLOR_CALCULATOR) private readonly dominantColorCalculator?: DominantColorCalculatorInterface,
    ) {}

    private selectQueryBuilder(): QueryBuilder<FileInterface> {
        return this.filesRepository
            .createQueryBuilder("file")
            .select("*")
            .leftJoinAndSelect("file.image", "image")
            .leftJoinAndSelect("file.folder", "folder");
    }

    async findAll(
        { folderId, includeArchived, filter, sortColumnName, sortDirection }: Omit<FileArgsInterface, "offset" | "limit" | "scope">,
        scope?: DamScopeInterface,
    ): Promise<FileInterface[]> {
        const isSearching = filter?.searchText !== undefined && filter.searchText.length > 0;
        const isFilteringByIds = filter?.ids !== undefined && filter.ids.length > 0;
        const ignoreFolder = isSearching || isFilteringByIds;

        return withFilesSelect(this.selectQueryBuilder(), {
            archived: !includeArchived ? false : undefined,
            folderId: !ignoreFolder ? folderId || null : undefined,
            mimetypes: filter?.mimetypes,
            ids: filter?.ids,
            query: filter?.searchText,
            sortColumnName,
            sortDirection,
            scope,
        }).getResult();
    }

    async findAndCount(
        { folderId, includeArchived, filter, sortColumnName, sortDirection, offset, limit }: Omit<FileArgsInterface, "scope">,
        scope?: DamScopeInterface,
    ): Promise<[FileInterface[], number]> {
        const isSearching = filter?.searchText !== undefined && filter.searchText.length > 0;
        const isFilteringByIds = filter?.ids !== undefined && filter.ids.length > 0;
        const ignoreFolder = isSearching || isFilteringByIds;

        const files = await withFilesSelect(this.selectQueryBuilder(), {
            archived: !includeArchived ? false : undefined,
            folderId: !ignoreFolder ? folderId || null : undefined,
            mimetypes: filter?.mimetypes,
            ids: filter?.ids,
            query: filter?.searchText,
            sortColumnName,
            sortDirection,
            offset,
            limit,
            scope,
        }).getResult();

        const totalCount = await withFilesSelect(this.selectQueryBuilder(), {
            archived: !includeArchived ? false : undefined,
            folderId: !ignoreFolder ? folderId || null : undefined,
            mimetypes: filter?.mimetypes,
            ids: filter?.ids,
            query: filter?.searchText,
            sortColumnName,
            sortDirection,
            offset,
            limit,
            scope,
        }).getCount();

        return [files, totalCount];
    }

    async findAllByHash(contentHash: string, options?: { scope?: DamScopeInterface }): Promise<FileInterface[]> {
        return withFilesSelect(this.selectQueryBuilder(), { contentHash, scope: options?.scope }).getResult();
    }

    async findMultipleByIds(ids: string[]) {
        return withFilesSelect(this.selectQueryBuilder(), {})
            .where({ id: { $in: ids } })
            .getResult();
    }

    async findCopiesOfFileInScope(fileId: string, imageCropArea?: ImageCropAreaInput, scope?: DamScopeInterface) {
        return withFilesSelect(this.selectQueryBuilder(), { copyOfId: fileId, imageCropArea, scope }).getResult();
    }

    async findOneById(id: string): Promise<FileInterface | null> {
        return withFilesSelect(this.selectQueryBuilder(), { id }).getSingleResult();
    }

    async getDamPath(file: FileInterface): Promise<string> {
        const folderNames = file.folder ? (await this.foldersService.findAncestorsByParentId(file.folder.id)).map((folder) => folder.name) : [];
        return `/${folderNames.join("/")}`;
    }

    async findOneByHash(contentHash: string): Promise<FileInterface | null> {
        return withFilesSelect(this.selectQueryBuilder(), { contentHash }).getSingleResult();
    }

    async calculateHashForFile(filePath: string): Promise<string> {
        return hasha.fromFile(filePath, { algorithm: "md5" });
    }

    async findOneByFilenameAndFolder(
        {
            filename,
            folderId = null,
        }: {
            filename: string;
            folderId?: string | null;
        },
        scope?: DamScopeInterface,
    ): Promise<FileInterface | null> {
        return withFilesSelect(this.selectQueryBuilder(), { folderId, filename, scope }).getSingleResult();
    }

    async findOneByImageId(imageId: string): Promise<FileInterface | null> {
        return withFilesSelect(this.selectQueryBuilder(), { imageId }).getSingleResult();
    }

    async create({ folderId, ...data }: CreateFileInput & { copyOf?: FileInterface }): Promise<FileInterface> {
        const folder = folderId ? await this.foldersService.findOneById(folderId) : undefined;
        return this.save(
            this.filesRepository.create({
                ...data,
                license: { ...data.license },
                folder: folder?.id,
                importSourceId: data.importSourceId,
                importSourceType: data.importSourceType,
            }),
        );
    }

    async replace(
        fileToReplace: FileInterface,
        uploadedFile: FileUploadInput,
        assignData: Omit<UploadFileBodyInterface, "scope" | "folderId">,
    ): Promise<FileInterface> {
        let result: FileInterface | undefined = undefined;
        try {
            const existingCategory = getDamFileCategory(fileToReplace.mimetype);
            const uploadedCategory = getDamFileCategory(uploadedFile.mimetype);

            if (existingCategory === "document") {
                // Files in the "document" category serve varying purposes: a VTT file is a video's subtitles, a PDF is a download.
                if (uploadedFile.mimetype !== fileToReplace.mimetype) {
                    throw new DextinityValidationException(
                        `File cannot be replaced by a file of a different mimetype. Existing mimetype: ${fileToReplace.mimetype}, new mimetype: ${uploadedFile.mimetype}`,
                    );
                }
            } else if (uploadedCategory !== existingCategory) {
                throw new DextinityValidationException(
                    `File cannot be replaced by a file of a different category. Existing category: ${existingCategory} (${fileToReplace.mimetype}), new category: ${uploadedCategory} (${uploadedFile.mimetype})`,
                );
            }

            const name = await this.getNameForReplacedFile(fileToReplace, uploadedFile);

            const uploadedFileMetadata = await this.getFileMetadataForUpload(uploadedFile);
            const oldAndNewFileAreIdentical = fileToReplace.contentHash === uploadedFileMetadata.contentHash;

            if (!oldAndNewFileAreIdentical) {
                // Don't upload the file if it is identical to the existing one
                await this.blobStorageBackendService.upload(uploadedFile, uploadedFileMetadata.contentHash, this.config.filesDirectory);

                // Check if the current file is the only one using the contentHash before deleting from blob storage
                if (
                    (await withFilesSelect(this.filesRepository.createQueryBuilder("file"), { contentHash: fileToReplace.contentHash }).getResult())
                        .length === 1
                ) {
                    await this.blobStorageBackendService.removeFile(this.config.filesDirectory, createHashedPath(fileToReplace.contentHash));
                }
            }

            if (uploadedFileMetadata.image && uploadedFileMetadata.image.width && uploadedFileMetadata.image.height && fileToReplace.image) {
                fileToReplace.image.width = uploadedFileMetadata.image.width;
                fileToReplace.image.height = uploadedFileMetadata.image.height;
                fileToReplace.image.exif = uploadedFileMetadata.exifData;
            }

            Object.assign(fileToReplace, {
                name,
                size: uploadedFile.size,
                mimetype: uploadedFile.mimetype,
                contentHash: uploadedFileMetadata.contentHash,
                ...assignData,
            });

            result = await this.save(fileToReplace);

            rimraf.sync(uploadedFile.path);
        } catch (e) {
            rimraf.sync(uploadedFile.path);
            throw e;
        }

        return result;
    }

    private async getNameForReplacedFile(fileToReplace: FileInterface, uploadedFile: FileUploadInput): Promise<string> {
        const previousExtension = extname(fileToReplace.name);
        const newExtension = extname(uploadedFile.originalname).toLowerCase();

        if (newExtension === previousExtension.toLowerCase()) {
            return fileToReplace.name;
        }

        // fileToReplace.name is already slugified, so only the extension needs to be swapped
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

    async updateById(id: string, data: UpdateFileInput): Promise<FileInterface> {
        const file = await this.findOneById(id);
        if (!file) {
            throw new DextinityEntityNotFoundException();
        }
        return this.updateByEntity(file, data);
    }

    async updateByEntity(entity: FileInterface, { image, ...input }: UpdateFileInput): Promise<FileInterface> {
        const folderId = input.folderId !== undefined ? input.folderId : entity.folder?.id;
        const folder = folderId ? await this.foldersService.findOneById(folderId) : null;

        if (entity.image && image?.cropArea) {
            entity.image.cropArea = image.cropArea;
        }

        if (input.name) {
            const entityWithSameName = await this.findOneByFilenameAndFolder({ filename: input.name, folderId }, entity.scope);
            if (entityWithSameName !== null && entityWithSameName.id !== entity.id) {
                throw new Error(`Entity with name '${input.name}' already exists in ${folder ? `folder '${folder.name}'` : "root folder"}`);
            }
        }

        const file = Object.assign(entity, {
            ...input,
            folder: folderId !== undefined ? folder : entity.folder,
        });
        return this.save(file);
    }

    async moveBatch(files: FileInterface[], targetFolder: FolderInterface | null): Promise<FileInterface[]> {
        const updatedFiles = [];

        for (const file of files) {
            if (targetFolder?.scope !== undefined && !contentScopesAreEqual(file.scope, targetFolder.scope)) {
                throw new Error("Target folder scope doesn't match file scope");
            }

            updatedFiles.push(await this.updateByEntity(file, { folderId: targetFolder?.id ?? null }));
        }

        return updatedFiles;
    }

    async delete(id: string): Promise<boolean> {
        const file = await this.findOneById(id);
        if (!file) {
            throw new DextinityEntityNotFoundException();
        }

        const result = await this.filesRepository.nativeDelete(id);
        const deleted = result === 1;

        if (
            deleted &&
            (await withFilesSelect(this.filesRepository.createQueryBuilder("file"), { contentHash: file.contentHash }).getResult()).length === 0
        ) {
            await this.blobStorageBackendService.removeFile(this.config.filesDirectory, createHashedPath(file.contentHash));
        }

        return deleted;
    }

    async save(entity: FileInterface): Promise<FileInterface> {
        await this.entityManager.persistAndFlush(entity);
        return entity;
    }

    async upload(
        file: FileUploadInput,
        { folderId, scope, ...assignData }: Omit<UploadFileBodyInterface, "scope"> & { scope?: DamScopeInterface },
    ): Promise<FileInterface> {
        let result: FileInterface | undefined = undefined;
        try {
            const { exifData, contentHash, image } = await this.getFileMetadataForUpload(file);
            await this.blobStorageBackendService.upload(file, contentHash, this.config.filesDirectory);

            const name = await this.findNextAvailableFilename({ filePath: file.originalname, folderId, scope });

            result = await this.create({
                name,
                folderId: folderId,
                size: file.size,
                mimetype: file.mimetype,
                image:
                    image !== undefined
                        ? {
                              width: image.width,
                              height: image.height,
                              exif: exifData,
                              cropArea: {
                                  focalPoint: FocalPoint.SMART,
                              },
                          }
                        : undefined,
                contentHash,
                scope,
                ...assignData,
            });

            if (result.image && this.dominantColorCalculator) {
                const dominantColorCalculator = this.dominantColorCalculator;
                // We do not want for our users to await the dominant color calculation. To prevent concurrency issues we must use a separate Unit of
                // Work. This can be achieved by forking the EntityManager instance.
                // See https://mikro-orm.io/docs/faq#you-cannot-call-emflush-from-inside-lifecycle-hook-handlers and
                // https://mikro-orm.io/docs/unit-of-work for more information.
                const entityManager = this.orm.em.fork();
                const image = await entityManager.findOneOrFail(DamFileImage, result.image.id);

                dominantColorCalculator.calculateDominantColor(contentHash).then((dominantColor) => {
                    image.dominantColor = dominantColor;
                    return entityManager.flush();
                });
            }
            rimraf.sync(file.path);
        } catch (e) {
            rimraf.sync(file.path);
            throw e;
        }

        return result;
    }

    async getFilePosition(fileId: string, args: Omit<DamFileListPositionArgs, "scope">, scope?: DamScopeInterface): Promise<number> {
        const isSearching = args.filter?.searchText !== undefined && args.filter.searchText.length > 0;

        const subQb = withFilesSelect(
            this.filesRepository
                .createQueryBuilder("file")
                .select(["file.id", raw(`ROW_NUMBER() OVER( ORDER BY file."${args.sortColumnName}" ${args.sortDirection} ) AS row_number`)])
                .leftJoinAndSelect("file.folder", "folder"),
            {
                archived: !args.includeArchived ? false : undefined,
                folderId: !isSearching ? args.folderId || null : undefined,
                mimetypes: args.filter?.mimetypes,
                query: args.filter?.searchText,
                sortColumnName: args.sortColumnName,
                sortDirection: args.sortDirection,
                scope,
            },
        );

        const result: { rows: Array<{ row_number: string }> } = await this.filesRepository.getKnex().raw(
            `select "file_with_row_number".row_number
                from "${FILE_TABLE_NAME}" as "file"
                join (${subQb.getFormattedQuery()}) as "file_with_row_number" ON file_with_row_number.id = file.id
                where "file"."id" = ?
            `,
            [fileId],
        );

        if (result.rows.length === 0) {
            throw new Error("File ID does not exist.");
        }

        // make the positions start with 0
        return Number(result.rows[0].row_number) - 1;
    }

    async createCopyOfFile(file: FileInterface, { inboxFolder }: { inboxFolder: FolderInterface }) {
        let fileImageInput: ImageFileInput | undefined;
        if (file.image) {
            const { id: ignoreId, file: ignoreFile, ...imageProps } = file.image;
            fileImageInput = { ...Utils.copy(imageProps) };
        }

        const {
            id: ignoreId,
            createdAt: ignoreCreatedAt,
            updatedAt: ignoreUpdatedAt,
            folder: ignoreFolder,
            image: ignoreImage,
            scope: ignoreScope,
            copies: ignoreCopies,
            alternativesForThisFile: ignoreAlternativesForThisFile,
            thisFileIsAlternativeFor: ignoreThisFileIsAlternativeFor,
            ...fileProps
        } = file;

        const fileInput: CreateFileInput & { copyOf: FileInterface } = {
            ...Utils.copy(fileProps),
            image: fileImageInput,
            folderId: inboxFolder.id,
            copyOf: file,
            scope: inboxFolder.scope,
        };

        const copiedFile = await this.create(fileInput);

        // handled DAM alternatives
        const copiedAlternatives: DamMediaAlternative[] = [];
        if ((await file.alternativesForThisFile.loadItems()).length > 0) {
            for (const alternative of file.alternativesForThisFile) {
                const alternativeFile = await alternative.alternative.load();
                if (alternativeFile === null) {
                    continue;
                }

                const copiedAlternativeFile = await this.createCopyOfFile(alternativeFile, { inboxFolder });

                const { id: ignoreId, for: ignoreFor, alternative: ignoreAlternative, ...alternativeProps } = alternative;
                const copiedDamMediaAlternative = this.damMediaAlternativesRepository.create({
                    ...alternativeProps,

                    for: copiedFile,
                    alternative: copiedAlternativeFile,
                });

                copiedAlternatives.push(copiedDamMediaAlternative);
            }
        }

        copiedFile.alternativesForThisFile.set(copiedAlternatives);

        return copiedFile;
    }

    async copyFilesToScope({ fileIds, inboxFolderId }: { fileIds: string[]; inboxFolderId: string }) {
        const inboxFolder = await this.foldersService.findOneById(inboxFolderId);
        if (!inboxFolder) {
            throw new Error("Specified inbox folder doesn't exist.");
        }

        const files = await this.findMultipleByIds(fileIds);
        if (files.length === 0) {
            throw new Error("No valid file ids provided");
        }

        const mappedFiles: Array<{ rootFile: FileInterface; copy: FileInterface }> = [];
        for (const file of files) {
            const copiedFile = await this.createCopyOfFile(file, { inboxFolder });
            mappedFiles.push({ rootFile: file, copy: copiedFile });
        }

        return { mappedFiles };
    }

    async findNextAvailableFilename({
        filePath,
        folderId = null,
        scope,
    }: {
        filePath: string;
        folderId?: string | null;
        scope?: DamScopeInterface;
    }): Promise<string> {
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

    /**
     * @deprecated Use `DamDominantColorService.calculateDominantColor` instead. Returns `undefined` when `DamImagesModule`,
     * which provides the imgproxy-backed calculator, is not registered.
     */
    async calculateDominantColor(contentHash: string): Promise<string | undefined> {
        return this.dominantColorCalculator?.calculateDominantColor(contentHash);
    }

    async createFileUrl(file: FileInterface, { previewDamUrls = false }: { previewDamUrls?: boolean }): Promise<string> {
        const filename = parse(file.name).name;

        const baseUrl = [`/${this.config.basePath}/files`];

        if (previewDamUrls) {
            baseUrl.push("preview");
        } else {
            const hash = this.createHash({
                fileId: file.id,
                filename,
            });

            baseUrl.push(hash);
        }

        return [...baseUrl, file.contentHash, file.id, filename].join("/");
    }

    async getFileAsBase64String(file: FileInterface) {
        const fileStream = await this.blobStorageBackendService.getFile(this.config.filesDirectory, createHashedPath(file.contentHash));

        const chunks: Buffer[] = [];
        for await (const chunk of fileStream) {
            chunks.push(chunk);
        }

        const base64String = Buffer.concat(chunks).toString("base64");
        return `data:${file.mimetype};base64,${base64String}`;
    }

    async createFileDownloadUrl(file: FileInterface, { previewDamUrls = false }: { previewDamUrls?: boolean }): Promise<string> {
        const filename = parse(file.name).name;

        const baseUrl = [`/dam/files/download`];

        if (previewDamUrls) {
            baseUrl.push("preview");
        } else {
            const hash = this.createHash({
                fileId: file.id,
                filename,
            });

            baseUrl.push(hash);
        }

        return [...baseUrl, file.contentHash, file.id, filename].join("/");
    }

    createHash(params: FileParams): string {
        const fileHash = `file:${params.fileId}:${params.filename}`;
        return createHmac("sha1", this.config.secret).update(fileHash).digest("hex");
    }

    private async getFileMetadataForUpload(file: FileUploadInput): Promise<{
        exifData: Record<string, string | number | Uint8Array | number[] | Uint16Array> | undefined;
        contentHash: string;
        image: probe.ProbeResult | undefined;
    }> {
        const contentHash = await this.calculateHashForFile(file.path);
        let image: probe.ProbeResult | undefined;
        try {
            image = await probe(createReadStream(file.path));
            if (image.type == "svg") {
                image = undefined;
            }
            if (image !== undefined && image.orientation !== undefined && [6, 8].includes(image.orientation)) {
                image = {
                    ...image,
                    width: image.height,
                    height: image.width,
                };
            }
        } catch {
            // empty
        }

        if (
            image !== undefined &&
            image.width &&
            image.height &&
            Math.round(((image.width * image.height) / 1000000) * 10) / 10 >= this.config.maxSrcResolution
        ) {
            throw new DextinityImageResolutionException(`Maximal image resolution exceeded`);
        }

        let exifData: Record<string, string | number | Uint8Array | number[] | Uint16Array> | undefined;
        if (exifrSupportedMimetypes.includes(file.mimetype)) {
            try {
                exifData = await exifr.parse(file.path);
            } catch {
                // empty
            }
        }

        return { exifData, contentHash, image };
    }
}
