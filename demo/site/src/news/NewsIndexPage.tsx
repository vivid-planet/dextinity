import type { PredefinedPageRouteProps } from "@src/documents/predefinedPages/PredefinedPageRoute";

import { NewsPage } from "./NewsPage";
import { fetchNewsList } from "./NewsPage.loader";

export async function NewsIndexPage({ predefinedPage: { scope } }: PredefinedPageRouteProps) {
    return <NewsPage scope={scope} initialData={await fetchNewsList({ scope, limit: 2 })} />;
}
