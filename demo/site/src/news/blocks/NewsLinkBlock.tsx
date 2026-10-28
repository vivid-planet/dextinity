import type { PropsWithData } from "@dextinity/site-react";
import type { NewsLinkBlockData } from "@src/blocks.generated";
import { Link } from "@src/framework/Link";
import { createSitePath } from "@src/util/createSitePath";
import type { AnchorHTMLAttributes, JSX, PropsWithChildren } from "react";

type Props = PropsWithData<NewsLinkBlockData> & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

function NewsLinkBlock({ data: { news }, children, ...anchorProps }: PropsWithChildren<Props>): JSX.Element | null {
    if (news === undefined) {
        return <span className={anchorProps.className}>{children}</span>;
    }

    return (
        <Link
            {...anchorProps}
            href={createSitePath({
                scope: news.scope,
                path: `/news/${news.slug}`,
            })}
        >
            {children}
        </Link>
    );
}

export { NewsLinkBlock };
