import { and, asc, count, desc, eq, inArray, isNull, type SQL, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import type JSZip from "jszip";

import { badRequest, createHashedPath, notFound } from "../../../core/server/index.js";
import { containsIgnoringCase } from "../common/sql.util.js";
import type { DamScopeFilter } from "../dam.context.js";
import type { PaginationArgs, SortArgs, UpdateFolderInput } from "../dam.dto.js";
import type { DamServiceDependencies, DamServices } from "../dam.services.js";
import type { DamFolder } from "../dam.types.js";
import type { DamScope } from "../db/dam.schema.js";

export interface FolderListArgs extends SortArgs {
    parentId?: string;
    includeArchived?: boolean;
    searchText?: string;
    scopeFilter?: DamScopeFilter;
}

export class FoldersService {
    /** Aliased, so the correlated subqueries counting children and files can reference the outer row. */
    private readonly folderTable;

    constructor(
        private readonly deps: DamServiceDependencies,
        private readonly services: DamServices,
    ) {
        this.folderTable = alias(deps.schema.damFolders, "folder");
    }

    private get db() {
        return this.deps.database.drizzle;
    }

    async findOneById(id: string): Promise<DamFolder | null> {
        const [folder] = await this.select(eq(this.folderTable.id, id));
        return folder ?? null;
    }

    async findAllByIds(ids: string[]): Promise<DamFolder[]> {
        return ids.length > 0 ? this.select(inArray(this.folderTable.id, ids)) : [];
    }

    async findAllFlat(scope: DamScope | undefined): Promise<DamFolder[]> {
        return this.select(this.deps.scopeColumns.equals(this.folderTable, scope), { orderBy: [asc(this.folderTable.name)] });
    }

    async findAll(args: FolderListArgs, scope?: DamScope): Promise<DamFolder[]> {
        return this.select(this.listConditions(args, scope), { orderBy: this.orderBy(args) });
    }

    async findAndCount(args: FolderListArgs & PaginationArgs, scope: DamScope | undefined): Promise<[DamFolder[], number]> {
        const where = this.listConditions(args, scope);
        const folders = await this.select(where, { orderBy: this.orderBy(args), offset: args.offset, limit: args.limit });
        const [{ totalCount }] = await this.db.select({ totalCount: count() }).from(this.folderTable).where(where);
        return [folders, totalCount];
    }

    async findOneByNameAndParentId({ name, parentId }: { name: string; parentId?: string }, scope: DamScope | undefined): Promise<DamFolder | null> {
        const [folder] = await this.select(
            and(
                eq(this.folderTable.name, name),
                parentId ? eq(this.folderTable.parentId, parentId) : isNull(this.folderTable.parentId),
                this.deps.scopeColumns.equals(this.folderTable, scope),
            ),
        );
        return folder ?? null;
    }

    /** Root first, without the folder itself. */
    async findAncestors(folder: DamFolder): Promise<DamFolder[]> {
        return this.findAncestorsAndSelf(folder.parentId);
    }

    /** Root first, including the folder itself. */
    async findAncestorsAndSelf(folderId: string | null): Promise<DamFolder[]> {
        if (folderId === null) {
            return [];
        }
        const ids = await this.findAncestorAndSelfIds(folderId);
        if (ids.length === 0) {
            throw notFound(`Folder ${folderId} not found`);
        }
        const folders = await this.findAllByIds(ids);
        return ids.map((id) => folders.find((folder) => folder.id === id)).filter((folder) => folder !== undefined);
    }

    async create(
        { name, parentId, isInboxFromOtherScope = false }: { name: string; parentId?: string; isInboxFromOtherScope?: boolean },
        scope: DamScope | undefined,
    ): Promise<DamFolder> {
        const id = crypto.randomUUID();
        await this.db
            .insert(this.deps.schema.damFolders)
            .values({ id, name, parentId: parentId ?? null, isInboxFromOtherScope, ...this.deps.scopeColumns.toValues(scope) });
        return (await this.findOneById(id)) as DamFolder;
    }

    async update(folder: DamFolder, { parentId, ...input }: UpdateFolderInput): Promise<DamFolder> {
        const { damFolders } = this.deps.schema;
        if (parentId !== undefined && !(await this.isValidParentForFolder(folder.id, parentId))) {
            throw badRequest("Cannot make a folder its own child.");
        }

        await this.db
            .update(damFolders)
            .set({
                ...input,
                ...(parentId !== undefined ? { parentId } : {}),
                // If the user changes the folder name, it's treated as a normal folder now
                isInboxFromOtherScope: input.name === undefined || input.name === folder.name ? folder.isInboxFromOtherScope : false,
            })
            .where(eq(damFolders.id, folder.id));

        return (await this.findOneById(folder.id)) as DamFolder;
    }

    async moveBatch({ folderIds, targetFolderId }: { folderIds: string[]; targetFolderId: string | null }): Promise<DamFolder[]> {
        const moved: DamFolder[] = [];
        for (const folderId of folderIds) {
            const folder = await this.findOneById(folderId);
            if (!folder) {
                throw notFound(`Folder ${folderId} not found`);
            }
            moved.push(await this.update(folder, { parentId: targetFolderId }));
        }
        return moved;
    }

    async delete(id: string): Promise<boolean> {
        for (const file of await this.services.files.findAll({ folderId: id, includeArchived: true })) {
            await this.services.files.delete(file);
        }
        for (const subFolder of await this.findAll({ parentId: id, includeArchived: true })) {
            await this.delete(subFolder.id);
        }
        return (await this.db.delete(this.deps.schema.damFolders).where(eq(this.deps.schema.damFolders.id, id)).returning()).length === 1;
    }

    async isValidParentForFolder(folderId: string, parentId: string | null): Promise<boolean> {
        return !(await this.findAncestorsAndSelf(parentId)).some((ancestor) => ancestor.id === folderId);
    }

    async getFolderPosition(folderId: string, args: FolderListArgs, scope: DamScope | undefined): Promise<number> {
        const rows = this.db
            .select({
                id: this.folderTable.id,
                rowNumber: sql<number>`row_number() over (order by ${this.sortExpression(args)} ${sql.raw(args.sortDirection ?? "ASC")})`.as(
                    "row_number",
                ),
            })
            .from(this.folderTable)
            .where(this.listConditions(args, scope))
            .as("folder_with_row_number");

        const [row] = await this.db.select({ rowNumber: rows.rowNumber }).from(rows).where(eq(rows.id, folderId));
        if (!row) {
            throw notFound("Folder ID does not exist.");
        }
        // Make the positions start with 0
        return Number(row.rowNumber) - 1;
    }

    async createZip(folderId: string): Promise<Blob> {
        const { default: JSZip } = await import("jszip");
        const zip = new JSZip();
        await this.addFolderToZip(folderId, zip);
        return zip.generateAsync({ type: "blob" });
    }

    private async addFolderToZip(folderId: string, zip: JSZip): Promise<void> {
        for (const file of await this.services.files.findAll({ folderId })) {
            const stream = await this.deps.blobStorage.getFile(this.deps.config.filesDirectory, createHashedPath(file.contentHash));
            if (stream) {
                zip.file(file.name, await new Response(stream).arrayBuffer());
            }
        }

        const countedSubfolderNames: Record<string, number> = {};
        for (const subfolder of await this.findAll({ parentId: folderId })) {
            countedSubfolderNames[subfolder.name] = (countedSubfolderNames[subfolder.name] ?? 0) + 1;
            const duplicateCount = countedSubfolderNames[subfolder.name];
            const subfolderZip = zip.folder(duplicateCount > 1 ? `${subfolder.name} ${duplicateCount}` : subfolder.name);
            if (!subfolderZip) {
                throw new Error(`Error while creating zip from folder with id ${folderId}`);
            }
            await this.addFolderToZip(subfolder.id, subfolderZip);
        }
    }

    /** Recursive, because folders only reference their parent. Root first. */
    private async findAncestorAndSelfIds(folderId: string): Promise<string[]> {
        const { damFolders } = this.deps.schema;
        const rows = await this.deps.database.rows<{ id: string }>(sql`
            with recursive ancestors(id, parent_id, depth) as (
                select ${damFolders.id}, ${damFolders.parentId}, 0 from ${damFolders} where ${damFolders.id} = ${folderId}
                union all
                select parent."id", parent."parentId", ancestors.depth + 1 from ${damFolders} parent join ancestors on parent."id" = ancestors.parent_id
            )
            select id from ancestors order by depth desc
        `);
        return rows.map(({ id }) => id);
    }

    private numberOfChildFolders() {
        const { damFolders } = this.deps.schema;
        return this.db.$count(damFolders, eq(damFolders.parentId, this.folderTable.id));
    }

    private numberOfFiles() {
        const { damFiles } = this.deps.schema;
        return this.db.$count(damFiles, eq(damFiles.folderId, this.folderTable.id));
    }

    private sortExpression({ sortColumnName }: SortArgs): SQL {
        if (sortColumnName === "size") {
            return sql`(${this.numberOfChildFolders()} + ${this.numberOfFiles()})`;
        }
        if (sortColumnName === "createdAt" || sortColumnName === "updatedAt") {
            return sql`${this.folderTable[sortColumnName]}`;
        }
        // Folders have no mimetype, so they are sorted by name instead
        return sql`${this.folderTable.name}`;
    }

    private orderBy(args: SortArgs): SQL[] {
        if (!args.sortColumnName) {
            return [];
        }
        const direction = args.sortDirection === "DESC" ? desc : asc;
        return [direction(this.sortExpression(args)), asc(this.folderTable.id)];
    }

    private listConditions({ parentId, includeArchived, searchText, scopeFilter }: FolderListArgs, scope: DamScope | undefined): SQL | undefined {
        const isSearching = searchText !== undefined && searchText.length > 0;
        return and(
            includeArchived ? undefined : eq(this.folderTable.archived, false),
            isSearching ? undefined : parentId ? eq(this.folderTable.parentId, parentId) : isNull(this.folderTable.parentId),
            this.deps.scopeColumns.equals(this.folderTable, scope),
            scopeFilter?.(this.deps.scopeColumns.byDimension(this.folderTable)),
            ...(isSearching ? searchText.split(" ").map((term) => containsIgnoringCase(this.folderTable.name, term)) : []),
        );
    }

    private async select(
        where: SQL | undefined,
        { orderBy = [], offset, limit }: { orderBy?: SQL[]; offset?: number; limit?: number } = {},
    ): Promise<DamFolder[]> {
        const query = this.db
            .select({
                folder: this.folderTable,
                scope: this.deps.scopeColumns.select(this.folderTable),
                numberOfChildFolders: this.numberOfChildFolders(),
                numberOfFiles: this.numberOfFiles(),
            })
            .from(this.folderTable)
            .where(where)
            .orderBy(...orderBy)
            .$dynamic();

        if (offset !== undefined) {
            query.offset(offset);
        }
        if (limit !== undefined) {
            query.limit(limit);
        }

        return (await query).map(({ folder, scope, numberOfChildFolders, numberOfFiles }) => ({
            id: folder.id,
            name: folder.name,
            parentId: folder.parentId,
            archived: folder.archived,
            isInboxFromOtherScope: folder.isInboxFromOtherScope,
            numberOfChildFolders: Number(numberOfChildFolders),
            numberOfFiles: Number(numberOfFiles),
            createdAt: folder.createdAt,
            updatedAt: folder.updatedAt,
            scope: this.deps.scopeColumns.fromRow(scope),
        }));
    }
}
