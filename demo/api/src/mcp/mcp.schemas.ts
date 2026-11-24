import { PageTreeNodeCategory } from "@src/page-tree/page-tree-node-category.js";
import { z } from "zod";

const domainSchema = z.string().describe('Domain, e.g. "main"');

export const pageTreeScopeSchema = z
    .strictObject({
        domain: domainSchema,
        language: z.string().describe('Language, e.g. "en"'),
    })
    .describe("Content scope of the page tree");

export const damScopeSchema = z.strictObject({ domain: domainSchema }).describe("Scope of the DAM");

export const pageTreeCategorySchema = z.enum(PageTreeNodeCategory);
