export const damDefaultBasePath = "dam";

export interface DamConfig {
    secret: string;
    allowedImageSizes: number[];
    allowedAspectRatios: string[];
    filesDirectory: string;
    acceptedMimeTypes?: string[];
    /** In megabytes */
    maxFileSize: number;
    /** In megapixels */
    maxSrcResolution: number;
    basePath?: string;
    includeFormatExtensionInImageUrls?: boolean;
    /** 1–100, for lossy formats */
    imageQuality?: number;
    /**
     * Validates uploaded SVGs, e.g. with DOMPurify. SVGs can contain scripts, so SVG uploads are rejected without a validator.
     * The NestJS API uses jsdom for this, which doesn't run on Cloudflare Workers.
     */
    isValidSvg?: (svg: string) => Promise<boolean>;
}

export type ResolvedDamConfig = DamConfig & { basePath: string; acceptedMimeTypes: string[] };
