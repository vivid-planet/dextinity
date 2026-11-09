"use client";

import { usePreview } from "@dextinity/site-nextjs";
import type { LinkBlockData } from "@src/blocks.generated";
import type { PropsWithChildren } from "react";

import { isValidLink } from "./isValidLink";

export function HiddenIfInvalidLink({ link, children }: PropsWithChildren<{ link: LinkBlockData }>) {
    const { previewType } = usePreview();

    if (previewType === "BlockPreview") {
        return <>{children}</>;
    }

    if (!isValidLink(link)) {
        return null;
    }

    return <>{children}</>;
}
