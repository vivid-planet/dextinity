import type { PropsWithData } from "@dextinity/site-nextjs";
import type { NewsLinkBlockData } from "@src/blocks.generated";
import { NewsLink } from "@src/news/NewsLink";
import type { AnchorHTMLAttributes, JSX, PropsWithChildren } from "react";

type Props = PropsWithData<NewsLinkBlockData> & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

function NewsLinkBlock({ data: { news }, children, ...anchorProps }: PropsWithChildren<Props>): JSX.Element | null {
    if (news === undefined) {
        return <span className={anchorProps.className}>{children}</span>;
    }

    return (
        <NewsLink {...anchorProps} news={news}>
            {children}
        </NewsLink>
    );
}

export { NewsLinkBlock };
