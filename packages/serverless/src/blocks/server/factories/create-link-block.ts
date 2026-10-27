import { z } from "zod";

import type { SupportedBlocks } from "../block.js";
import { createOneOfBlock } from "./create-one-of-block.js";

/** One of the supported link types, e.g. internal, external and email links, with an optional title */
export function createLinkBlock({ name = "Link", supportedBlocks }: { name?: string; supportedBlocks: SupportedBlocks }) {
    return createOneOfBlock({ name, supportedBlocks, additionalFields: { title: z.string().optional() } });
}
