"use client";
import { ListBlock, type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { CallToActionListBlockData } from "@src/blocks.generated";

import { CallToActionBlock } from "./CallToActionBlock";
import styles from "./CallToActionListBlock.module.scss";

type CallToActionListBlockProps = PropsWithData<CallToActionListBlockData>;

export const CallToActionListBlock = withPreview(
    ({ data }: CallToActionListBlockProps) =>
        data.blocks.length > 0 ? (
            <div className={styles.root}>
                <ListBlock data={data} block={(block) => <CallToActionBlock data={block} />} />
            </div>
        ) : null,
    { label: "Call To Action List" },
);
