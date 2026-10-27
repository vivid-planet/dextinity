import { z } from "zod";

import { focalPoints } from "./common/focal-point.js";
import { aiContentTypes, licenseTypes } from "./db/dam.schema.js";

/** Query parameters are strings, so the input type for typed clients is a string as well. */
const integerParam = z
    .string()
    .regex(/^\d+$/)
    .transform((value) => Number(value));

export const booleanParam = z.enum(["true", "false"]).transform((value) => value === "true");

/** A repeated query parameter (`?mimetypes=a&mimetypes=b`) arrives as an array, a single one as a string. */
export const stringArrayParam = z.union([z.string(), z.array(z.string())]).transform((value) => (Array.isArray(value) ? value : [value]));

export const sortQuery = {
    sortColumnName: z.enum(["name", "createdAt", "updatedAt", "size", "mimetype"]).optional(),
    sortDirection: z.enum(["ASC", "DESC"]).optional(),
};

export const paginationQuery = {
    offset: integerParam.optional(),
    limit: integerParam.pipe(z.number().min(1).max(100)).optional(),
};

export type SortArgs = { sortColumnName?: "name" | "createdAt" | "updatedAt" | "size" | "mimetype"; sortDirection?: "ASC" | "DESC" };

export type PaginationArgs = { offset: number; limit: number };

const imageCropAreaInput = z.object({
    focalPoint: z.enum(focalPoints),
    width: z.number().min(0).max(100).nullish(),
    height: z.number().min(0).max(100).nullish(),
    x: z.number().min(0).max(100).nullish(),
    y: z.number().min(0).max(100).nullish(),
});

const licenseInput = z.object({
    type: z.enum(licenseTypes).nullish(),
    details: z.string().nullish(),
    author: z.string().nullish(),
    durationFrom: z.coerce.date().nullish(),
    durationTo: z.coerce.date().nullish(),
});

type LicenseInput = z.infer<typeof licenseInput>;

export const updateFileInput = z.object({
    name: z.string().min(1).optional(),
    title: z.string().nullish(),
    altText: z.string().nullish(),
    aiContentType: z.enum(aiContentTypes).nullish(),
    folderId: z.uuid().nullish(),
    image: z.object({ cropArea: imageCropAreaInput.optional() }).optional(),
    license: licenseInput.optional(),
});

export type UpdateFileInput = z.infer<typeof updateFileInput>;

export const createFolderInput = z.object({
    name: z.string().min(1),
    parentId: z.uuid().optional(),
    isInboxFromOtherScope: z.boolean().optional(),
});

export const updateFolderInput = z.object({
    name: z.string().min(1).optional(),
    parentId: z.uuid().nullish(),
    archived: z.boolean().optional(),
});

export type UpdateFolderInput = z.infer<typeof updateFolderInput>;

const jsonString = z.string().transform((value, ctx) => {
    try {
        return JSON.parse(value) as unknown;
    } catch {
        ctx.addIssue({ code: "custom", message: "Invalid JSON" });
        return z.NEVER;
    }
});

/**
 * The multipart fields of the upload endpoints. Wire-compatible with the NestJS API, which expects objects as JSON strings.
 */
export const uploadFileFields = {
    title: z.string().optional(),
    altText: z.string().optional(),
    license: jsonString.pipe(licenseInput).optional(),
    imageCropArea: jsonString.pipe(imageCropAreaInput).optional(),
    importSourceId: z.string().min(1).optional(),
    importSourceType: z.string().min(1).optional(),
};

export function jsonStringOf<TSchema extends z.ZodType>(schema: TSchema) {
    return jsonString.pipe(schema);
}

export interface UploadFileAssignData {
    title?: string;
    altText?: string;
    license?: LicenseInput;
    imageCropArea?: z.infer<typeof imageCropAreaInput>;
    importSourceId?: string;
    importSourceType?: string;
}
