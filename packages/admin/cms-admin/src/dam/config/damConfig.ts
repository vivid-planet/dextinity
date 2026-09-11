import type { ReactNode } from "react";

import { useDextinityConfig } from "../../config/DextinityConfigContext";

export interface DamConfig {
    acceptedMimeTypes?: string[];
    scopeParts?: string[];
    enableLicenseFeature?: boolean;
    requireLicense?: boolean;
    additionalToolbarItems?: ReactNode;
    importSources?: Record<string, { label: ReactNode }>;
    contentGeneration?: {
        generateAltText?: boolean;
        generateImageTitle?: boolean;
    };
    uploadsMaxFileSize: number;
    allowedImageAspectRatios: string[];
    maxSrcResolution: number;
    basePath?: string;
    videoPerformanceWarningFileSize?: number | false;
}

const defaultVideoPerformanceWarningFileSize = 10;

export function useDamConfig(): DamConfig {
    const dextinityConfig = useDextinityConfig();

    if (!dextinityConfig.dam) {
        throw new Error("No DAM configuration found. Make sure to set `dam` in `DextinityConfigProvider`.");
    }

    return dextinityConfig.dam;
}

interface VideoPerformanceWarning {
    enabled: boolean;
    maxFileSizeInBytes: number;
    isVideoTooLarge: (file: { mimetype: string; size: number }) => boolean;
}

export function useVideoPerformanceWarning(): VideoPerformanceWarning {
    const { videoPerformanceWarningFileSize } = useDamConfig();

    const enabled = videoPerformanceWarningFileSize !== false;
    const maxFileSizeInMegabytes =
        typeof videoPerformanceWarningFileSize === "number" ? videoPerformanceWarningFileSize : defaultVideoPerformanceWarningFileSize;
    const maxFileSizeInBytes = maxFileSizeInMegabytes * 1024 * 1024;

    const isVideoTooLarge = (file: { mimetype: string; size: number }) =>
        enabled && file.mimetype.startsWith("video/") && file.size > maxFileSizeInBytes;

    return { enabled, maxFileSizeInBytes, isVideoTooLarge };
}

export function useDamBasePath(): string {
    const damConfig = useDamConfig();

    return damConfig.basePath ?? "dam";
}
