import { type PropsWithData, withPreview } from "@dextinity/site-react-router";
import type { NewsListBlockData } from "@src/blocks.generated";
import { createSitePath } from "@src/util/createSitePath";
import { Link } from "react-router";

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
                        <Link
                            to={createSitePath({
                                scope: news.scope,
                                path: `/news/${news.slug}`,
                            })}
                        >
                            {news.title}
                        </Link>
                    </li>
                ))}
            </ol>
        );
    },
    { label: "News List" },
);
