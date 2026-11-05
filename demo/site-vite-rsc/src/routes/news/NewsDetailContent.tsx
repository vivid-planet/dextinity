"use client";

import { DamImageBlock } from "@src/common/blocks/DamImageBlock";
import { NewsContentBlock } from "@src/news/blocks/NewsContentBlock";
import { FormattedDate } from "react-intl";

import type { GQLNewsDetailPageFragment } from "./newsDetailFragment.generated";

type Props = {
    news: GQLNewsDetailPageFragment;
};
export function NewsDetailContent({ news }: Props) {
    return (
        <div>
            <DamImageBlock data={news.image} sizes="100vw" aspectRatio="16x9" />
            <h1>{news.title}</h1>
            <p>
                <FormattedDate value={news.createdAt} />
            </p>
            <hr />
            <NewsContentBlock data={news.content} />
        </div>
    );
}
