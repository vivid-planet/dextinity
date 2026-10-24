"use client";
import { LinkBlock } from "@src/common/blocks/LinkBlock";
import { usePathname } from "@src/framework/RouterProvider";
import { createSitePath } from "@src/util/createSitePath";
import type { JSX, PropsWithChildren } from "react";

import type { GQLPageLinkFragment } from "./PageLink.fragment.generated";

interface Props extends PropsWithChildren {
    page: GQLPageLinkFragment;
    className?: string;
    activeClassName?: string;
}

function PageLink({ page, children, className: passedClassName, activeClassName }: Props): JSX.Element | null {
    const pathname = usePathname();
    const active = (pathname?.substring(3) || "/") === page.path; // Remove language prefix

    let className = passedClassName;

    if (active) {
        className = className ? `${className} ${activeClassName}` : activeClassName;
    }

    if (page.documentType === "Link") {
        if (page.document === null || page.document.__typename !== "Link") {
            return null;
        }

        return (
            <LinkBlock data={page.document.content} className={className}>
                {children}
            </LinkBlock>
        );
    } else if (page.documentType === "Page") {
        return (
            <a
                href={createSitePath({
                    path: page.path,
                    scope: page.scope,
                })}
                className={className}
            >
                {children}
            </a>
        );
    } else if (page.documentType === "PredefinedPage") {
        return (
            <a
                href={createSitePath({
                    path: page.path,
                    scope: page.scope,
                })}
                className={className}
            >
                {children}
            </a>
        );
    } else {
        if (process.env.NODE_ENV === "development") {
            throw new Error(`Unknown documentType "${page.documentType}"`);
        }

        return null;
    }
}

export { PageLink };
