import { Command, Option } from "commander";

import { type BuildAssetsStorageConfig, createBuildAssetsStorage } from "./buildAssets/storage/buildAssetsStorage";
import { uploadBuildAssets } from "./buildAssets/uploadBuildAssets";

type UploadBuildAssetsOptions = {
    driver: "s3" | "azure";
    storageKeyPrefix: string;
    directory?: string;
    cacheControl?: string;
    keepBuilds: number;
    bucket?: string;
    region?: string;
    endpoint?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    accountName?: string;
    accountKey?: string;
    container?: string;
};

function createStorageConfig(options: UploadBuildAssetsOptions): BuildAssetsStorageConfig {
    if (options.driver === "s3") {
        if (!options.bucket || !options.accessKeyId || !options.secretAccessKey) {
            throw new Error("The s3 driver requires --bucket, --access-key-id and --secret-access-key");
        }
        return {
            driver: "s3",
            s3: {
                bucket: options.bucket,
                region: options.region,
                endpoint: options.endpoint,
                credentials: { accessKeyId: options.accessKeyId, secretAccessKey: options.secretAccessKey },
            },
        };
    } else {
        if (!options.accountName || !options.accountKey || !options.container) {
            throw new Error("The azure driver requires --account-name, --account-key and --container");
        }
        return { driver: "azure", azure: { accountName: options.accountName, accountKey: options.accountKey, container: options.container } };
    }
}

new Command("dextinity-upload-build-assets")
    .description('Uploads the .next/static files of the build to the build assets storage. Run it in the site directory after "next build".')
    .addOption(new Option("--driver <driver>", "storage driver").choices(["s3", "azure"]).makeOptionMandatory())
    .addOption(
        new Option(
            "--storage-key-prefix <prefix>",
            "prefix of the keys in the storage, separates the build assets of different projects sharing a storage",
        ).makeOptionMandatory(),
    )
    .option("--directory <directory>", "directory holding the build assets", ".next/static")
    .option("--cache-control <value>", "cache header of the uploaded files", "public, max-age=31536000, immutable")
    .option("--keep-builds <count>", "number of uploads whose build assets stay in the storage", (value) => Number(value), 10)
    .option("--bucket <bucket>", "s3: bucket")
    .option("--region <region>", "s3: region")
    .option("--endpoint <url>", "s3: endpoint")
    .option("--access-key-id <id>", "s3: access key ID")
    .option("--secret-access-key <key>", "s3: secret access key")
    .option("--account-name <name>", "azure: storage account name")
    .option("--account-key <key>", "azure: storage account key")
    .option("--container <container>", "azure: container")
    .action(async (options: UploadBuildAssetsOptions) => {
        await uploadBuildAssets({
            storage: await createBuildAssetsStorage(createStorageConfig(options)),
            storageKeyPrefix: options.storageKeyPrefix,
            directory: options.directory,
            cacheControl: options.cacheControl,
            keepBuilds: options.keepBuilds,
        });
    })
    .parseAsync()
    .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
