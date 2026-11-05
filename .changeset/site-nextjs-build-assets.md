---
"@dextinity/site-nextjs": minor
---

Add `dextinity-upload-build-assets` and `serveBuildAsset` to serve build assets of other builds during rolling deployments

During a rolling deployment, instances of the old and the new site build run side by side, so a request for a `/_next/static` file can reach an instance that doesn't have it.
`dextinity-upload-build-assets` uploads the `.next/static` files of a build to a storage that holds the files of every deployed build, and `serveBuildAsset` serves a file that's missing in the own build from there.
It passes on the content type and cache header stored with the file. Requests for other paths, for files of the own build and for files missing in the storage are left to Next.js.

S3-compatible storages (`s3`, e.g., AWS S3, DigitalOcean Spaces or IBM Cloud Object Storage) and Azure Blob Storage (`azure`) are supported.
They require `@aws-sdk/client-s3` or `@azure/storage-blob`. Only the SDK of the used storage is loaded.
The storage key prefix is required and must be unique per project, e.g., `my-project`, since a storage can be shared by several projects. If environments share a storage, add the environment, e.g., `my-project/prod`.
Use the same prefix for the upload and in the site server.

**1. Upload the build assets of every build**

Run `dextinity-upload-build-assets` in the site directory after `next build` and before the build is rolled out, e.g., at the end of the build or in a job before the deployment:

```bash
npx dextinity-upload-build-assets --driver s3 --storage-key-prefix my-project --bucket <bucket> --region <region> --endpoint <url> --access-key-id <id> --secret-access-key <key>
npx dextinity-upload-build-assets --driver azure --storage-key-prefix my-project --account-name <name> --account-key <key> --container <container>
```

The files are uploaded from `.next/static` with `Cache-Control: public, max-age=31536000, immutable`, like Next.js serves them. Use `--directory` and `--cache-control` to change them.

**2. Serve build assets of other builds in the site server**

```ts
// In server.ts
import { createBuildAssetsStorage, serveBuildAsset } from "@dextinity/site-nextjs/build-assets";

const buildAssetsStorage = await createBuildAssetsStorage({
    driver: "s3",
    s3: { bucket: process.env.BUILD_ASSETS_S3_BUCKET, region: process.env.BUILD_ASSETS_S3_REGION /* ... */ },
});

createServer(async (req, res) => {
    const parsedUrl = parse(req.url!, true);

    if (await serveBuildAsset({ req, res, storage: buildAssetsStorage, storageKeyPrefix: "my-project" })) {
        return;
    }

    await handle(req, res, parsedUrl);
});
```

Without a storage, e.g., in local development, all requests are left to Next.js.
