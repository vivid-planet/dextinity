"use client";
import { DamImageBlock } from "@src/common/blocks/DamImageBlock";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FormattedDate } from "react-intl";

import { fetchNewsList } from "./NewsPage.loader";
import type { GQLNewsIndexPageQuery } from "./NewsPage.loader.generated";
import styles from "./NewsPage.module.scss";

export function NewsPage({ initialData, scope }: { initialData: GQLNewsIndexPageQuery["newsList"]; scope: { domain: string; language: string } }) {
    const pathname = usePathname();
    const [newsList, setNewsList] = useState(initialData.nodes);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    return (
        // ID is used for skip link
        <main id="mainContent">
            <h1>News</h1>
            <div className={styles.cardList}>
                {newsList.map((news) => (
                    <Link key={news.id} href={`${pathname}/${news.slug}`} className={styles.card}>
                        <DamImageBlock data={news.image} aspectRatio="4x3" />
                        <h2>{news.title}</h2>
                        <p>
                            <FormattedDate value={news.createdAt} />
                        </p>
                    </Link>
                ))}
            </div>
            <div>
                {initialData.totalCount > newsList.length && (
                    <button
                        disabled={isLoading}
                        onClick={async () => {
                            setIsLoading(true);
                            setError(null);
                            try {
                                const response = await fetchNewsList({
                                    scope,
                                    offset: newsList.length,
                                    limit: 2,
                                });
                                setIsLoading(false);
                                setNewsList([...newsList, ...response.nodes]);
                            } catch (e) {
                                console.error("Error loading more news:", e);
                                setError(e instanceof Error ? e.message : String(e));
                            }
                        }}
                    >
                        Load more
                    </button>
                )}
                {isLoading && <div>Loading</div>}
                {error && <div>Error: {error}</div>}
            </div>
        </main>
    );
}
