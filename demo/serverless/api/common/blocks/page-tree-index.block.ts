import { createBlock } from "@dextinity/serverless/server";
import { z } from "zod";

/** Lists the pages of the tree on the site, the editor sets nothing */
export const PageTreeIndexBlock = createBlock("PageTreeIndex", z.strictObject({}));
