import { getBlocksMeta } from "@dextinity/cms-api";
import { promises as fs } from "fs";

import { NewsletterImageBlock } from "./src";

async function generateBlockMeta(): Promise<void> {
    console.info("Generating block-meta.json...");

    const metaJson = getBlocksMeta([NewsletterImageBlock]);
    await fs.writeFile("block-meta.json", JSON.stringify(metaJson, null, 4));

    console.info("Done!");
}

generateBlockMeta();
