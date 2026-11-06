import type { AssetBrowserAsset, AssetBrowserFolder, FocalPoint } from "@dextinity/ui";
import type { IntlShape } from "react-intl";

import type { GQLFocalPoint } from "../../graphql.generated";
import type { GQLDamFinderFoldersQuery } from "./DamFinderPage.gql.generated";
import type { GQLDamFinderFileFragment } from "./useDamFinderFiles.gql.generated";

export const damFinderRootFolderId = "root";

type DamFinderFolder = GQLDamFinderFoldersQuery["damFoldersFlat"][number];

const focalPoints: Record<GQLFocalPoint, FocalPoint | undefined> = {
    CENTER: { x: 0.5, y: 0.5 },
    NORTHEAST: { x: 1, y: 0 },
    NORTHWEST: { x: 0, y: 0 },
    SOUTHEAST: { x: 1, y: 1 },
    SOUTHWEST: { x: 0, y: 1 },
    SMART: undefined,
};

const fileSizeUnits = ["byte", "kilobyte", "megabyte", "gigabyte"] as const;

export function formatFileSize(intl: IntlShape, bytes: number) {
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1000 && unitIndex < fileSizeUnits.length - 1) {
        value /= 1000;
        unitIndex += 1;
    }
    return intl.formatNumber(value, { style: "unit", unit: fileSizeUnits[unitIndex], unitDisplay: "short", maximumFractionDigits: 1 });
}

export function getFileExtension(name: string) {
    const extension = name.includes(".") ? name.split(".").pop() : undefined;
    return extension?.toUpperCase();
}

export function getDamFinderAssetType(mimetype: string): AssetBrowserAsset["type"] {
    if (mimetype.startsWith("image/")) {
        return "image";
    }
    if (mimetype.startsWith("video/")) {
        return "video";
    }
    return "document";
}

export function getThumbnailUrl(file: GQLDamFinderFileFragment) {
    return file.image?.thumbnailUrl ?? (file.mimetype === "image/svg+xml" ? file.fileUrl : undefined);
}

export function toAssetBrowserFolder(intl: IntlShape, folder: DamFinderFolder): AssetBrowserFolder {
    return {
        id: folder.id,
        name: folder.name,
        parentId: folder.parent?.id ?? damFinderRootFolderId,
        meta: intl.formatMessage(
            { id: "dextinity.damFinder.itemCount", defaultMessage: "{count, plural, one {# item} other {# items}}" },
            { count: folder.numberOfFiles + folder.numberOfChildFolders },
        ),
    };
}

export function toAssetBrowserAsset(intl: IntlShape, file: GQLDamFinderFileFragment, folderId: string): AssetBrowserAsset {
    const type = getDamFinderAssetType(file.mimetype);
    const extension = getFileExtension(file.name);
    return {
        id: file.id,
        name: file.name,
        folderId,
        type,
        src: getThumbnailUrl(file),
        alt: file.altText ?? undefined,
        focalPoint: file.image != null ? focalPoints[file.image.cropArea.focalPoint] : undefined,
        badges: [...(file.aiContentType != null ? (["ai"] as const) : []), ...(type === "image" && !file.altText ? (["missingAlt"] as const) : [])],
        fileType: type === "document" ? extension : undefined,
        meta: [extension, formatFileSize(intl, file.size)].filter((part) => part != null).join(" · "),
        modified: intl.formatDate(file.updatedAt, { dateStyle: "medium" }),
    };
}
