export const damDefaultBasePath = "dam";

export interface DamConfig {
    secret: string;
    allowedImageSizes: number[];
    allowedAspectRatios: string[];
    filesDirectory: string;
    acceptedMimeTypes?: string[];
    maxFileSize: number;
    requireLicense?: boolean;
    enableLicenseFeature?: boolean;
    /**
     * Block delivery of files with an expired license on the public DAM routes (images and files).
     * Requires `enableLicenseFeature` to be enabled. Defaults to `false`.
     */
    blockFilesWithExpiredLicense?: boolean;
    maxSrcResolution: number;
    basePath: string;
}
