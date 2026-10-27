import { z } from "zod";

import { createBlock } from "../block.js";

export const AnchorBlock = createBlock("Anchor", z.strictObject({ name: z.string().optional() }));
