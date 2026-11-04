"use client";
import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { SpaceBlockData } from "@src/blocks.generated";

export const SpaceBlock = withPreview(
    ({ data: { spacing } }: PropsWithData<SpaceBlockData>) => {
        return <div style={{ height: `var(--spacing-${spacing})` }} />;
    },
    { label: "Space" },
);
