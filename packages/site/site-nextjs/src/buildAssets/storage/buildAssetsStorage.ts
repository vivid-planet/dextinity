import type { Readable } from "stream";

export type BuildAsset = {
    body: Readable;
    contentType?: string;
    cacheControl?: string;
};

export interface BuildAssetsStorage {
    /**
     * @returns `undefined` if the storage doesn't have the file
     */
    getFile(key: string): Promise<BuildAsset | undefined>;
    putFile(key: string, file: { body: Buffer; contentType?: string; cacheControl?: string }): Promise<void>;
}

// Not the SDK's S3ClientConfig, so the types don't require @aws-sdk/client-s3 when using another driver
export type S3BuildAssetsStorageConfig = {
    bucket: string;
    region?: string;
    endpoint?: string;
    credentials?: { accessKeyId: string; secretAccessKey: string };
};

export type BuildAssetsStorageConfig =
    { driver: "s3"; s3: S3BuildAssetsStorageConfig } | { driver: "azure"; azure: { accountName: string; accountKey: string; container: string } };

/**
 * Creates the storage holding the build assets of every deployed build.
 * Only the SDK of the chosen driver (`@aws-sdk/client-s3` or `@azure/storage-blob`) is loaded, so only that one needs to be installed.
 */
export async function createBuildAssetsStorage(config: BuildAssetsStorageConfig): Promise<BuildAssetsStorage> {
    if (config.driver === "s3") {
        const { createS3BuildAssetsStorage } = await import("./s3BuildAssetsStorage");
        return createS3BuildAssetsStorage(config.s3);
    } else if (config.driver === "azure") {
        const { createAzureBuildAssetsStorage } = await import("./azureBuildAssetsStorage");
        return createAzureBuildAssetsStorage(config.azure);
    } else {
        throw new Error(`Unsupported build assets storage driver: ${(config as { driver: string }).driver}. Supported drivers are: s3, azure`);
    }
}
