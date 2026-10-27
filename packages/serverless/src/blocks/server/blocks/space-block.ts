import { z } from "zod";

import { createBlock } from "../block.js";

export const SpaceBlock = createBlock("Space", z.strictObject({ height: z.number().int().min(0).max(1000) }));
