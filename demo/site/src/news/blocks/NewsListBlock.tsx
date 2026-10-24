import { type PropsWithData, withPreview } from "@dextinity/site-react";
import type { NewsListBlockData } from "@src/blocks.generated";
import { createSitePath } from "@src/util/createSitePath";

import type { LoadedData } from "./NewsListBlock.loader";

export const NewsListBlock = withPreview(
    ({ data: { loaded: newsList } }: PropsWithData<NewsListBlockData & { loaded: LoadedData }>) => {
        if (newsList.length === 0) {
            return null;
        }

        return (
            <ol>
                {newsList.map((news) => (
                    <li key={news.id}>
                        <a
                            href={createSitePath({
                                scope: news.scope,
                                path: `/news/${news.slug}`,
                            })}
                        >
                            {news.title}
                        </a>
                    </li>
                ))}
            </ol>
        );
    },
    { label: "News List" },
);
