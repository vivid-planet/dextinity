import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, NoSuchKey, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { Readable } from "stream";

import type { BuildAssetsStorage, S3BuildAssetsStorageConfig } from "./buildAssetsStorage";

const maxKeysPerDeleteRequest = 1000;

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
        async listFiles(prefix) {
            const keys: string[] = [];
            let continuationToken: string | undefined;
            do {
                const page = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: continuationToken }));
                for (const object of page.Contents ?? []) {
                    if (object.Key) {
                        keys.push(object.Key);
                    }
                }
                continuationToken = page.NextContinuationToken;
            } while (continuationToken);
            return keys;
        },
        async deleteFiles(keys) {
            for (let index = 0; index < keys.length; index += maxKeysPerDeleteRequest) {
                const { Errors: errors } = await client.send(
                    new DeleteObjectsCommand({
                        Bucket: bucket,
                        Delete: { Objects: keys.slice(index, index + maxKeysPerDeleteRequest).map((key) => ({ Key: key })), Quiet: true },
                    }),
                );
                // DeleteObjects reports failures for single keys in the response instead of throwing
                if (errors?.length) {
                    throw new Error(`Failed to delete ${errors.length} file(s), e.g., ${errors[0].Key}: ${errors[0].Message}`);
                }
            }
        },
    };
}
