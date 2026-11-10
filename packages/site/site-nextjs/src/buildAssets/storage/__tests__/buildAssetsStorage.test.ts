// @vitest-environment node
import { describe, expect, it } from "vitest";

import { type BuildAssetsStorageConfig, createBuildAssetsStorage } from "../buildAssetsStorage";

describe("createBuildAssetsStorage", () => {
    it("creates the storage of the driver", async () => {
        const storage = await createBuildAssetsStorage({ driver: "s3", s3: { bucket: "build-assets", region: "eu-central-1" } });

        expect(storage.getFile).toBeTypeOf("function");
    });

    it("fails for an unsupported driver", async () => {
        await expect(createBuildAssetsStorage({ driver: "gcs" } as unknown as BuildAssetsStorageConfig)).rejects.toThrow(
            "Unsupported build assets storage driver: gcs",
        );
    });
});
