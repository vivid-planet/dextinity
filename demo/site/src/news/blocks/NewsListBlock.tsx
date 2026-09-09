import { JsonLd, type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { NewsListBlockData } from "@src/blocks.generated";
import { createSitePath } from "@src/util/createSitePath";
import Link from "next/link";
import type { ItemList } from "schema-dts";

import type { LoadedData } from "./NewsListBlock.loader";

export const NewsListBlock = withPreview(
    ({ data: { loaded } }: PropsWithData<NewsListBlockData & { loaded: LoadedData }>) => {
        const { news, structuredData } = loaded;

        if (news.length === 0) {
            return null;
        }

        return (
            <>
                {structuredData && <JsonLd<ItemList> data={structuredData} />}
                <ol>
                    {news.map((item) => (
                        <li key={item.id}>
                            <Link
                                href={createSitePath({
                                    scope: item.scope,
                                    path: `/news/${item.slug}`,
                                })}
                            >
                                {item.title}
                            </Link>
                        </li>
                    ))}
                </ol>
            </>
        );
    },
    { label: "News List" },
);
