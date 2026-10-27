import { z } from "zod";

import { type Block, createBlock } from "../block.js";
import { createOptionalBlock } from "./create-optional-block.js";

export const sitemapPagePriorities = ["0_0", "0_1", "0_2", "0_3", "0_4", "0_5", "0_6", "0_7", "0_8", "0_9", "1_0"] as const;

export const sitemapPageChangeFrequencies = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] as const;

const json = z.string().refine((value) => {
    try {
        JSON.parse(value);
        return true;
    } catch {
        return false;
    }
}, "Invalid JSON");

/** The meta tags, Open Graph tags, structured data, sitemap settings and alternative links of a page */
export function createSeoBlock({ name = "Seo", image }: { name?: string; image: Block }) {
    return createBlock(
        name,
        z.strictObject({
            htmlTitle: z.string().optional(),
            metaDescription: z.string().optional(),
            openGraphTitle: z.string().optional(),
            openGraphDescription: z.string().optional(),
            openGraphImage: createOptionalBlock(image).schema,
            structuredData: json.optional(),
            noIndex: z.boolean(),
            priority: z.enum(sitemapPagePriorities),
            changeFrequency: z.enum(sitemapPageChangeFrequencies),
            canonicalUrl: z.url().optional(),
            alternativeLinks: z.array(z.strictObject({ code: z.string().optional(), url: z.url().optional() })),
        }),
    );
}
