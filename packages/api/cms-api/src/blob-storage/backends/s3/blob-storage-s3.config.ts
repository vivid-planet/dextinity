import type { S3ClientConfig } from "@aws-sdk/client-s3";

export interface BlobStorageS3Config {
    driver: "s3";
    s3: S3ClientConfig & { bucket: string };
}
