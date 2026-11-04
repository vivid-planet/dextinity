import type { PropsWithData } from "@dextinity/site-react";
import type { InternalLinkBlockData } from "@src/blocks.generated";
import type { GQLPageTreeNodeScope } from "@src/graphql.generated";
import { createSitePath } from "@src/util/createSitePath";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import { Link } from "react-router";

interface InternalLinkBlockProps
    extends PropsWithChildren<PropsWithData<InternalLinkBlockData>>, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {}

export function InternalLinkBlock({ data: { targetPage, targetPageAnchor }, children, ...anchorProps }: InternalLinkBlockProps) {
    if (!targetPage) {
        return <span className={anchorProps.className}>{children}</span>;
    }

    if (targetPage.scope == null) {
        throw new Error("InternalLinkBlock: targetPage.scope is required");
    }

    const pathWithAnchor = targetPageAnchor !== undefined ? `${targetPage.path}#${targetPageAnchor}` : targetPage.path;

    return (
        <Link
            {...anchorProps}
            to={createSitePath({
                scope: targetPage.scope as GQLPageTreeNodeScope,
                path: pathWithAnchor,
            })}
        >
            {children}
        </Link>
    );
}
