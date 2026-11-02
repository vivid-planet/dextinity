export const dynamic = "error";

import type { VisibilityParam } from "@src/middleware/domainRewrite";
import { NewsPage } from "@src/news/NewsPage";
import { fetchNewsList } from "@src/news/NewsPage.loader";
import { setVisibilityParam } from "@src/util/ServerContext";
import { setServerIntlForScope } from "@src/util/setServerIntlForScope";

export default async function NewsIndexPage({ params }: PageProps<"/[visibility]/[domain]/[language]/news">) {
    const { visibility, domain, language } = await params;
    setVisibilityParam(visibility as VisibilityParam);
    await setServerIntlForScope({ domain, language });
    return <NewsPage scope={{ domain, language }} initialData={await fetchNewsList({ scope: { domain, language }, limit: 2 })} />;
}
