"use client";

import { usePredefinedPages } from "@src/documents/predefinedPages/PredefinedPagesProvider";
import type { ContentScope } from "@src/site-configs";
import Link from "next/link";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";

import { createNewsSitePath } from "./createNewsSitePath";

type Props = PropsWithChildren<
    {
        news: { slug: string; scope: ContentScope };
    } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">
>;

export function NewsLink({ news, children, ...anchorProps }: Props) {
    const predefinedPages = usePredefinedPages();
    const href = createNewsSitePath({ predefinedPages, news });

    if (href === undefined) {
        return <span className={anchorProps.className}>{children}</span>;
    }

    return (
        <Link {...anchorProps} href={href}>
            {children}
        </Link>
    );
}
