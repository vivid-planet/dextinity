import type { PropsWithData } from "@dextinity/site-react-router";
import type { NewsLinkBlockData } from "@src/blocks.generated";
import { createSitePath } from "@src/util/createSitePath";
import type { AnchorHTMLAttributes, JSX, PropsWithChildren } from "react";
import { Link } from "react-router";

type Props = PropsWithData<NewsLinkBlockData> & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

function NewsLinkBlock({ data: { news }, children, ...anchorProps }: PropsWithChildren<Props>): JSX.Element | null {
    if (news === undefined) {
        return <span className={anchorProps.className}>{children}</span>;
    }

    return (
        <Link
            {...anchorProps}
            to={createSitePath({
                scope: news.scope,
                path: `/news/${news.slug}`,
            })}
        >
            {children}
        </Link>
    );
}

export { NewsLinkBlock };
