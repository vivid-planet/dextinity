import type { PredefinedPage } from "@src/documents/predefinedPages/predefinedPages";
import { notFound } from "next/navigation";

import { NewsDetailPage } from "./NewsDetailPage";
import { NewsPage } from "./NewsPage";
import { fetchNewsList } from "./NewsPage.loader";

type Props = {
    predefinedPage: PredefinedPage;
    segments: string[];
};

export async function NewsPredefinedPage({ predefinedPage, segments }: Props) {
    const { scope } = predefinedPage;

    if (segments.length === 0) {
        return <NewsPage scope={scope} initialData={await fetchNewsList({ scope, limit: 2 })} />;
    }

    if (segments.length === 1) {
        return <NewsDetailPage slug={segments[0]} newsPredefinedPage={predefinedPage} />;
    }

    notFound();
}
