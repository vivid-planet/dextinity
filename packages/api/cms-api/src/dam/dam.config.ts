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
    maxSrcResolution: number;
    basePath: string;
}
