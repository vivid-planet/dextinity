import { z } from "zod";

import { createBlock } from "../block.js";

/** A space with one of the given spacings, e.g. `["d100", "d200"]` */
export function createSpaceBlock({ name = "Space", spacings }: { name?: string; spacings: readonly [string, ...string[]] }) {
    return createBlock(name, z.strictObject({ spacing: z.enum(spacings) }));
}
