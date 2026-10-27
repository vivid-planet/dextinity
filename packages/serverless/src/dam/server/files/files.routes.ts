import { type Context, Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { z } from "zod";

import {
    badRequest,
    createHashedPath,
    DextinityHttpException,
    notFound,
    scopesAreEqual,
    unprocessableEntity,
    zValidator,
} from "../../../core/server/index.js";
import { requirePermission } from "../../../permissions/server/index.js";
import { contentDisposition, isValidHash } from "../common/http.util.js";
import type { DamEnv, DamRouteContext, DamRouteHelpers, DamScopeSchema } from "../dam.context.js";
import { booleanParam, jsonStringOf, paginationQuery, sortQuery, stringArrayParam, updateFileInput, uploadFileFields } from "../dam.dto.js";
import type { DamFile } from "../dam.types.js";
import { toUploadedFile, validateFileContents, validateFileMetadata } from "./file-validation.js";

const publicCacheControl = "max-age=31536000, s-maxage=86400, public"; // Public cache, 1 year for browsers, 1 day for proxies/CDNs
const privateCacheControl = "max-age=31536000, private"; // Local caches only (1 year)

const idParam = z.object({ id: z.uuid() });
const fileUrlParams = z.object({ contentHash: z.string().regex(/^[0-9a-f]{32}$/), fileId: z.uuid(), filename: z.string() });
const hashedFileUrlParams = fileUrlParams.extend({ hash: z.string() });

function calculatePartialRange(size: number, range: string): { start: number; end: number } {
    const [startString, endString] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(startString, 10);
    const end = endString ? parseInt(endString, 10) : size - 1;
    if (isNaN(start) && !isNaN(end)) {
        return { start: size - end, end: size - 1 };
    }
    return { start, end: isNaN(end) ? size - 1 : end };
}

async function streamFile(
    c: Context<DamEnv>,
    file: DamFile,
    { disposition, cacheControl, filesDirectory }: { disposition: "inline" | "attachment"; cacheControl: string; filesDirectory: string },
): Promise<Response> {
    const headers: Record<string, string> = {
        "content-type": file.mimetype,
        "last-modified": file.updatedAt.toUTCString(),
        "content-disposition": contentDisposition(disposition, file.name),
        "cache-control": cacheControl,
        "accept-ranges": "bytes",
    };

    const range = c.req.header("range");
    if (range) {
        const { start, end } = calculatePartialRange(file.size, range);
        if (start >= file.size || end >= file.size) {
            return c.body(null, 416, { "content-range": `bytes */${file.size}` });
        }
        const stream = await c.var.blobStorage.getFile(filesDirectory, createHashedPath(file.contentHash), {
            offset: start,
            length: end - start + 1,
        });
        if (!stream) {
            throw notFound();
        }
        return c.body(stream, 206, { ...headers, "content-range": `bytes ${start}-${end}/${file.size}`, "content-length": String(end - start + 1) });
    }

    const stream = await c.var.blobStorage.getFile(filesDirectory, createHashedPath(file.contentHash));
    if (!stream) {
        throw notFound();
    }
    return c.body(stream, 200, { ...headers, "content-length": String(file.size) });
}

export function createFilesRoutes<TScopeSchema extends DamScopeSchema>(
    { config, scopeSchema }: DamRouteContext<TScopeSchema>,
    helpers: DamRouteHelpers<TScopeSchema>,
) {
    type Scope = z.infer<TScopeSchema>;
    const requireDamPermission = requirePermission("dam");

    const listArgs = z.object({
        folderId: z.uuid().optional(),
        includeArchived: booleanParam.optional(),
        searchText: z.string().optional(),
        mimetypes: stringArrayParam.optional(),
        ids: stringArrayParam.pipe(z.array(z.uuid())).optional(),
        ...paginationQuery,
        ...sortQuery,
    });

    const uploadFormWithoutScope = z.object({ file: z.instanceof(File), folderId: z.uuid().optional(), ...uploadFileFields });
    const uploadForm = uploadFormWithoutScope.extend({ scope: jsonStringOf(scopeSchema) });
    const replaceByIdForm = z.object({ file: z.instanceof(File), fileId: z.uuid(), ...uploadFileFields });

    // The multipart overhead is small compared to the files, 1 MB leaves plenty of room for it.
    const uploadBodyLimit = bodyLimit({
        maxSize: (config.maxFileSize + 1) * 1024 * 1024,
        onError: () => {
            throw new DextinityHttpException(413, "File too large");
        },
    });

    async function validateUpload(file: File) {
        const metadataError = validateFileMetadata(file, config);
        if (metadataError) {
            throw unprocessableEntity(`Rejected File Upload: ${metadataError}`);
        }
        if (file.size > config.maxFileSize * 1024 * 1024) {
            throw new DextinityHttpException(413, "File too large");
        }
        const uploadedFile = await toUploadedFile(file);
        const contentError = await validateFileContents(uploadedFile, config);
        if (contentError) {
            throw unprocessableEntity(`Rejected File Upload: ${contentError}`);
        }
        return uploadedFile;
    }

    async function findFileOrFail(c: Context<DamEnv>, id: string): Promise<DamFile> {
        const file = await c.var.dam.files.findOneById(id);
        if (!file) {
            throw notFound(`File ${id} not found`);
        }
        helpers.assertScopeAllowed(c, file.scope);
        return file;
    }

    async function findFileForUrl(c: Context<DamEnv>, { fileId, contentHash }: { fileId: string; contentHash: string }) {
        const file = await c.var.dam.files.findOneById(fileId);
        if (!file) {
            throw notFound();
        }
        if (file.contentHash !== contentHash) {
            throw badRequest("Content Hash mismatch!");
        }
        return file;
    }

    return new Hono<DamEnv>()
        .get("/", requireDamPermission, zValidator("query", helpers.scopedQuery(listArgs)), async (c) => {
            const { scope, args } = helpers.splitScopedQuery(listArgs, c.req.valid("query"));
            helpers.assertScopeAllowed(c, scope);
            const { offset = 0, limit = 25, ...filter } = args;
            const [files, totalCount] = await c.var.dam.files.findAndCount({ ...filter, offset, limit, scopeFilter: helpers.scopeFilter(c) }, scope);
            return c.json({ nodes: files.map((file) => helpers.serializeFile(c, file)), totalCount });
        })
        .post(
            "/filenames-occupied",
            requireDamPermission,
            zValidator("json", z.object({ scope: scopeSchema, filenames: z.array(z.object({ name: z.string(), folderId: z.uuid().nullish() })) })),
            async (c) => {
                const { scope, filenames } = c.req.valid("json") as { scope: Scope; filenames: Array<{ name: string; folderId?: string | null }> };
                helpers.assertScopeAllowed(c, scope);
                const result = [];
                for (const { name, folderId = null } of filenames) {
                    const isOccupied = await c.var.dam.files.isFilenameOccupied({ filename: name, folderId }, helpers.nonEmptyScopeOrNothing(scope));
                    result.push({ name, folderId, isOccupied });
                }
                return c.json(result);
            },
        )
        .post(
            "/move",
            requireDamPermission,
            zValidator("json", z.object({ fileIds: z.array(z.uuid()), targetFolderId: z.uuid().nullable() })),
            async (c) => {
                const { fileIds, targetFolderId } = c.req.valid("json");
                const targetFolder = targetFolderId ? await c.var.dam.folders.findOneById(targetFolderId) : null;
                if (targetFolderId && !targetFolder) {
                    throw notFound(`Folder ${targetFolderId} not found`);
                }
                const files = await c.var.dam.files.findAllByIds(fileIds);
                for (const file of files) {
                    helpers.assertScopeAllowed(c, file.scope);
                    if (targetFolder && !scopesAreEqual(targetFolder.scope, file.scope)) {
                        throw badRequest("Target folder scope doesn't match file scope");
                    }
                }
                const moved = await c.var.dam.files.moveBatch(files, targetFolder);
                return c.json(moved.map((file) => helpers.serializeFile(c, file)));
            },
        )
        .post("/archive", requireDamPermission, zValidator("json", z.object({ ids: z.array(z.uuid()) })), async (c) => {
            const files = await c.var.dam.files.findAllByIds(c.req.valid("json").ids);
            for (const file of files) {
                helpers.assertScopeAllowed(c, file.scope);
            }
            return c.json((await c.var.dam.files.setArchived(files, true)).map((file) => helpers.serializeFile(c, file)));
        })
        .post("/restore", requireDamPermission, zValidator("json", z.object({ ids: z.array(z.uuid()) })), async (c) => {
            const files = await c.var.dam.files.findAllByIds(c.req.valid("json").ids);
            for (const file of files) {
                helpers.assertScopeAllowed(c, file.scope);
            }
            return c.json((await c.var.dam.files.setArchived(files, false)).map((file) => helpers.serializeFile(c, file)));
        })
        .post("/upload", requireDamPermission, uploadBodyLimit, zValidator("form", uploadForm), async (c) => {
            const {
                file,
                folderId,
                scope: passedScope,
                ...assignData
            } = c.req.valid("form") as z.output<typeof uploadFormWithoutScope> & { scope: Scope };
            const scope = helpers.nonEmptyScopeOrNothing(passedScope);
            helpers.assertScopeAllowed(c, scope);

            if (folderId) {
                const folder = await c.var.dam.folders.findOneById(folderId);
                if (!folder) {
                    throw badRequest(`Folder ${folderId} not found`);
                }
                if (!scopesAreEqual(helpers.nonEmptyScopeOrNothing(folder.scope), scope)) {
                    throw badRequest("Folder scope doesn't match passed scope");
                }
            }

            const uploadedFile = await c.var.dam.files.upload(await validateUpload(file), { ...assignData, folderId, scope });
            return c.json(helpers.serializeFile(c, uploadedFile), 201);
        })
        .post("/replace-by-id", requireDamPermission, uploadBodyLimit, zValidator("form", replaceByIdForm), async (c) => {
            const { file, fileId, ...assignData } = c.req.valid("form");
            const fileToReplace = await findFileOrFail(c, fileId);
            const replacedFile = await c.var.dam.files.replace(fileToReplace, await validateUpload(file), assignData);
            return c.json(helpers.serializeFile(c, replacedFile));
        })
        .get("/preview/:contentHash/:fileId/:filename", requireDamPermission, zValidator("param", fileUrlParams), async (c) => {
            const file = await findFileForUrl(c, c.req.valid("param"));
            helpers.assertScopeAllowed(c, file.scope);
            return streamFile(c, file, { disposition: "inline", cacheControl: privateCacheControl, filesDirectory: config.filesDirectory });
        })
        .get("/download/preview/:contentHash/:fileId/:filename", requireDamPermission, zValidator("param", fileUrlParams), async (c) => {
            const file = await findFileForUrl(c, c.req.valid("param"));
            helpers.assertScopeAllowed(c, file.scope);
            return streamFile(c, file, { disposition: "attachment", cacheControl: privateCacheControl, filesDirectory: config.filesDirectory });
        })
        .get("/download/:hash{[0-9a-f]{40}}/:contentHash/:fileId/:filename", zValidator("param", hashedFileUrlParams), async (c) => {
            const { hash, ...params } = c.req.valid("param");
            if (!isValidHash(hash, c.var.dam.files.createHash(params))) {
                throw badRequest("Invalid hash");
            }
            const file = await findFileForUrl(c, params);
            // Requested with a filename that no longer matches the file. The hash still validates because it was signed for that
            // filename, so permanently redirect to the current canonical URL instead of serving under the stale one.
            if (params.filename !== file.name) {
                return c.redirect(c.var.dam.files.createFileDownloadUrl(file), 301);
            }
            return streamFile(c, file, { disposition: "attachment", cacheControl: publicCacheControl, filesDirectory: config.filesDirectory });
        })
        .get("/:hash{[0-9a-f]{40}}/:contentHash/:fileId/:filename", zValidator("param", hashedFileUrlParams), async (c) => {
            const { hash, ...params } = c.req.valid("param");
            if (!isValidHash(hash, c.var.dam.files.createHash(params))) {
                throw badRequest("Invalid hash");
            }
            const file = await findFileForUrl(c, params);
            if (params.filename !== file.name) {
                return c.redirect(c.var.dam.files.createFileUrl(file), 301);
            }
            return streamFile(c, file, { disposition: "inline", cacheControl: publicCacheControl, filesDirectory: config.filesDirectory });
        })
        .get("/:id", requireDamPermission, zValidator("param", idParam), async (c) => {
            const file = await findFileOrFail(c, c.req.valid("param").id);
            const duplicates = (await c.var.dam.files.findAllByHash(file.contentHash, file.scope)).filter((duplicate) => duplicate.id !== file.id);
            return c.json({
                ...helpers.serializeFile(c, file),
                damPath: await c.var.dam.files.getDamPath(file),
                duplicates: duplicates.map((duplicate) => ({ id: duplicate.id, name: duplicate.name, folder: duplicate.folder })),
            });
        })
        .patch("/:id", requireDamPermission, zValidator("param", idParam), zValidator("json", updateFileInput), async (c) => {
            const file = await findFileOrFail(c, c.req.valid("param").id);
            const input = c.req.valid("json");
            if (input.folderId) {
                const folder = await c.var.dam.folders.findOneById(input.folderId);
                if (!folder) {
                    throw badRequest(`Folder ${input.folderId} not found`);
                }
                helpers.assertScopeAllowed(c, folder.scope);
            }
            return c.json(helpers.serializeFile(c, await c.var.dam.files.update(file, input)));
        })
        .delete("/:id", requireDamPermission, zValidator("param", idParam), async (c) => {
            const file = await findFileOrFail(c, c.req.valid("param").id);
            return c.json({ deleted: await c.var.dam.files.delete(file) });
        });
}
