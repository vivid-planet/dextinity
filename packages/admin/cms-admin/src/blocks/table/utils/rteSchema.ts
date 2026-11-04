import { z } from "zod";

// Only the injected rich text block knows the shape of a cell payload.
export const rteSchema = z.record(z.string(), z.unknown());
