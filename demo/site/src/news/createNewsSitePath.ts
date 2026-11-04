import { createPredefinedPageSitePath, type PredefinedPage } from "@src/documents/predefinedPages/predefinedPages";
import type { ContentScope } from "@src/site-configs";

export function createNewsSitePath({ predefinedPages, news }: { predefinedPages: PredefinedPage[]; news: { slug: string; scope: ContentScope } }) {
    return createPredefinedPageSitePath({ predefinedPages, type: "news", scope: news.scope, path: `/${news.slug}` });
}
