"use client";
import type { PropsWithData } from "@dextinity/site-nextjs";
import type { ProductLinkBlockData } from "@src/blocks.generated";
import { createSitePath } from "@src/util/createSitePath";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { AnchorHTMLAttributes, JSX, PropsWithChildren } from "react";

type Props = PropsWithData<ProductLinkBlockData> & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

function ProductLinkBlock({ data: { product }, children, ...anchorProps }: PropsWithChildren<Props>): JSX.Element | null {
    const params = useParams<{ language: string }>();

    if (product === undefined || !params?.language) {
        return <span className={anchorProps.className}>{children}</span>;
    }

    return (
        <Link
            {...anchorProps}
            href={createSitePath({
                scope: { language: params.language },
                path: `/product/${product.slug}`,
            })}
        >
            {children}
        </Link>
    );
}

export { ProductLinkBlock };
