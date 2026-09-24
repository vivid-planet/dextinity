import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, describe, expect, it } from "vitest";

import { generateBlockTypes } from "./generate-block-types";

let directory: string | undefined;

afterEach(async () => {
    if (directory) {
        await rm(directory, { recursive: true, force: true });
    }
});

describe("generateBlockTypes", () => {
    it("should write the description of a block above its generated interfaces", async () => {
        directory = await mkdtemp(join(tmpdir(), "generate-block-types-"));
        const inputFile = join(directory, "block-meta.json");
        const outputFile = join(directory, "blocks.generated.ts");
        const fields = [{ name: "eyebrow", kind: "String", nullable: true }];

        await writeFile(
            inputFile,
            JSON.stringify([
                { name: "Headline", description: "A headline with an eyebrow text above it.", fields, inputFields: fields },
                { name: "Ratio", description: "An aspect ratio, for instance 16/9 */ 2.", fields: [], inputFields: [] },
                { name: "Space", fields: [], inputFields: [] },
            ]),
        );

        await generateBlockTypes.parseAsync(["--inputs", "--input-file", inputFile, "--output-file", outputFile], { from: "user" });

        const content = await readFile(outputFile, "utf-8");

        expect(content).toContain("/**\n * A headline with an eyebrow text above it.\n */\nexport interface HeadlineBlockData {");
        expect(content).toContain("/**\n * A headline with an eyebrow text above it.\n */\nexport interface HeadlineBlockInput {");
        expect(content).toContain("/**\n * An aspect ratio, for instance 16/9 *\\/ 2.\n */\nexport interface RatioBlockData {");
        expect(content).toContain("export interface SpaceBlockData {");
    });
});
