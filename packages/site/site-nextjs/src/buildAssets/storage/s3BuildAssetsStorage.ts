import { GetObjectCommand, NoSuchKey, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { Readable } from "stream";

import type { BuildAssetsStorage, S3BuildAssetsStorageConfig } from "./buildAssetsStorage";

export function createS3BuildAssetsStorage({ bucket, ...clientConfig }: S3BuildAssetsStorageConfig): BuildAssetsStorage {
    const client = new S3Client(clientConfig);

    return {
        async getFile(key) {
            try {
                const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
                return { body: object.Body as Readable, contentType: object.ContentType, cacheControl: object.CacheControl };
            } catch (error) {
                if (error instanceof NoSuchKey) {
                    return undefined;
                }
                throw error;
            }
        },
        async putFile(key, { body, contentType, cacheControl }) {
            await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType, CacheControl: cacheControl }));
        },
    };
}
