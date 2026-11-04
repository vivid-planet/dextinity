"use client";

import { DamImageBlock } from "@src/common/blocks/DamImageBlock";
import { FormattedDate } from "react-intl";

import { NewsContentBlock } from "./blocks/NewsContentBlock";
import type { GQLNewsDetailFragment } from "./NewsDetail.fragment.generated";

type Props = {
    news: GQLNewsDetailFragment;
};
export function NewsDetail({ news }: Props) {
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
