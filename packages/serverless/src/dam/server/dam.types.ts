import type { FocalPoint } from "./common/focal-point.js";
import type { aiContentTypes, DamScope, licenseTypes } from "./db/dam.schema.js";

export interface ImageCropArea {
    focalPoint: FocalPoint;
    width?: number | null;
    height?: number | null;
    x?: number | null;
    y?: number | null;
}

export interface DamFileImage {
    id: string;
    width: number;
    height: number;
    exif: Record<string, unknown> | null;
    dominantColor: string | null;
    cropArea: ImageCropArea;
}

export interface DamFileLicense {
    type: (typeof licenseTypes)[number] | null;
    details: string | null;
    author: string | null;
    durationFrom: Date | null;
    durationTo: Date | null;
}

export interface DamFile<TScope extends DamScope = DamScope> {
    id: string;
    folder: { id: string; name: string } | null;
    name: string;
    size: number;
    mimetype: string;
    contentHash: string;
    title: string | null;
    altText: string | null;
    aiContentType: (typeof aiContentTypes)[number] | null;
    archived: boolean;
    image: DamFileImage | null;
    license: DamFileLicense;
    importSourceId: string | null;
    importSourceType: string | null;
    copyOfId: string | null;
    createdAt: Date;
    updatedAt: Date;
    scope: TScope;
}

export interface DamFolder<TScope extends DamScope = DamScope> {
    id: string;
    name: string;
    parentId: string | null;
    archived: boolean;
    isInboxFromOtherScope: boolean;
    numberOfChildFolders: number;
    numberOfFiles: number;
    createdAt: Date;
    updatedAt: Date;
    scope: TScope;
}
