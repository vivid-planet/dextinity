import { promises as fs } from "fs";

import { NewsletterImageBlock } from "./src";
import { getBlocksMeta } from "@dextinity/cms-api";

async function generateBlockMeta(): Promise<void> {
    console.info("Generating block-meta.json...");

    NewsletterImageBlock; // Has to be defined so the block is registered for getBlocksMeta()

    const metaJson = getBlocksMeta();
    await fs.writeFile("block-meta.json", JSON.stringify(metaJson, null, 4));

    console.info("Done!");
}

generateBlockMeta();
