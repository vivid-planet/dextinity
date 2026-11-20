import { readFile } from "node:fs/promises";

import { RequiredPermission } from "@dextinity/cms-api";
import { Injectable, NotFoundException, UseGuards } from "@nestjs/common";
import { Tool } from "@nestjs/mcp";
import { z } from "zod";

import { SignedInUserGuard } from "./mcp-tool.utils.js";

// Written by the API itself at the root of the app, which is the same two levels up from src/mcp and dist/mcp.
const blockMetaUrl = new URL("../../block-meta.json", import.meta.url);

// The entries are returned unchanged, so only the field the tools look at is typed.
type BlockMeta = {
    name: string;
};

async function loadBlockMeta(): Promise<BlockMeta[]> {
    return JSON.parse(await readFile(blockMetaUrl, "utf-8")) as BlockMeta[];
}

const getBlockSchemaParameters = z.object({
    name: z.string().describe('The block name, e.g. "Accordion" (case-insensitive)'),
});

@Injectable()
// The schemas aren't scoped, but they are no one's business outside the admin's page tree either.
@RequiredPermission("pageTree", { skipScopeCheck: true })
@UseGuards(SignedInUserGuard)
export class BlockTools {
    @Tool({
        name: "list_available_blocks",
        description: `List the names of all available CMS content blocks.

Pass one of the returned names to the get_block_schema tool to get that block's fields and nesting.`,
        annotations: { readOnlyHint: true },
    })
    async listAvailableBlocks() {
        return (await loadBlockMeta()).map((block) => block.name);
    }

    @Tool({
        name: "get_block_schema",
        description: `Get the schema of a single CMS content block by name (e.g. "Accordion", "StandaloneHeading", "DamImage"). Use the list_available_blocks tool to find out which names exist.

"fields" is the shape the block is read in, "inputFields" the shape it is saved in. Fields of kind "Block" and "OneOfBlocks" name the blocks this one nests — call this tool again for those to walk a block tree one block at a time.

A block with the fields "attachedBlocks" and "activeType", such as "Link", holds one of several blocks: "attachedBlocks" lists them as entries of a "type" and the "props" of the block that type names, and "activeType" names the one in use, so an entry with that "type" must be in the list, e.g. {"attachedBlocks":[{"type":"external","props":{"targetUrl":"https://…","openInNewWindow":false,"noFollow":false}}],"activeType":"external"}. With "activeType" null, the block is empty.

Leave out a nullable field that should not be set, rather than passing null: some blocks read a null value as set, e.g. an image with "cropArea" null breaks the page, while one without "cropArea" uses the crop area of its DAM file.

A block's "description" says what the block is for and, where the fields alone don't say it, how to fill them: follow it, and look up every block it refers to with this tool too.`,
        inputSchema: getBlockSchemaParameters,
        annotations: { readOnlyHint: true },
    })
    async getBlockSchema({ name }: z.infer<typeof getBlockSchemaParameters>) {
        const block = (await loadBlockMeta()).find((candidate) => candidate.name.toLowerCase() === name.toLowerCase());
        if (!block) {
            throw new NotFoundException(`Unknown block "${name}". Use the list_available_blocks tool to get the available block names.`);
        }
        return block;
    }
}
