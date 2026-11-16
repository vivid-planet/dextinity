export const dynamic = "error";

import { setServerIntl } from "@dextinity/site-nextjs/server";
import type { VisibilityParam } from "@src/middleware/domainRewrite";
import { NewsPage } from "@src/news/NewsPage";
import { fetchNewsList } from "@src/news/NewsPage.loader";
import { loadMessages } from "@src/util/loadMessages";
import { setVisibilityParam } from "@src/util/ServerContext";
import { getSiteConfigForDomain } from "@src/util/siteConfig";
import { notFound } from "next/navigation";

export default async function NewsIndexPage({ params }: PageProps<"/[visibility]/[domain]/[language]/news">) {
    const { visibility, domain, language } = await params;
    setVisibilityParam(visibility as VisibilityParam);
    if (!getSiteConfigForDomain(domain).scope.languages.includes(language)) {
        notFound();
    }
    setServerIntl(language, await loadMessages(language));
    return <NewsPage scope={{ domain, language }} initialData={await fetchNewsList({ scope: { domain, language }, limit: 2 })} />;
}
