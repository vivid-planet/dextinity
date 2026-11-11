"use client";
import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { AnchorBlockData } from "@src/blocks.generated";

export const AnchorBlock = withPreview(
    ({ data: { name } }: PropsWithData<AnchorBlockData>) => {
        return name ? <div id={name} /> : null;
    },
    { label: "Anchor" },
);
