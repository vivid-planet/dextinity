import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { fetchStaticMailImage } from "../static-mail-image-fetcher";

describe("fetchStaticMailImage", () => {
    let directory: string;

    beforeAll(async () => {
        const root = await mkdtemp(join(tmpdir(), "mail-images-"));
        directory = join(root, "public");
        await mkdir(join(directory, "mail"), { recursive: true });
        await writeFile(join(directory, "mail", "logo.png"), "png");
        await writeFile(join(root, "secret.txt"), "secret");
    });

    it("reads a file of the directory, without the query string", async () => {
        await expect(fetchStaticMailImage(directory, "mail/logo.png?width=96")).resolves.toEqual({
            buffer: Buffer.from("png"),
            filename: "logo.png",
            contentType: "image/png",
        });
    });

    it("returns null for a path outside the directory", async () => {
        await expect(fetchStaticMailImage(directory, "../secret.txt")).resolves.toBeNull();
    });

    it("returns null for a file that doesn't exist", async () => {
        await expect(fetchStaticMailImage(directory, "mail/missing.png")).resolves.toBeNull();
    });
});
