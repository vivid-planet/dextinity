"use client";

import { type PropsWithData, usePreview, withPreview } from "@dextinity/site-nextjs";
import type { AccordionItemBlockData } from "@src/blocks.generated";
import clsx from "clsx";
import { type ReactNode, useId } from "react";

import { Typography } from "../components/Typography";
import { SvgUse } from "../helpers/SvgUse";
import styles from "./AccordionItemBlock.module.scss";

type AccordionItemBlockProps = PropsWithData<Omit<AccordionItemBlockData, "content">> & {
    content: ReactNode;
    isExpanded: boolean;
    onChange: () => void;
};

export const AccordionItemBlock = withPreview(
    ({ data: { title, titleHtmlTag }, content, isExpanded, onChange }: AccordionItemBlockProps) => {
        const headlineId = useId();
        const contentId = useId();
        const { previewType } = usePreview();

        return (
            <>
                <button id={headlineId} onClick={onChange} aria-expanded={isExpanded} aria-controls={contentId} className={styles.titleWrapper}>
                    <div className={styles.iconWrapper}>
                        <SvgUse href={isExpanded ? "/assets/icons/minus.svg#root" : "/assets/icons/plus.svg#root"} width={16} height={16} />
                    </div>
                    <Typography variant="headline350" as={titleHtmlTag}>
                        {title}
                    </Typography>
                </button>
                {/* In block preview, render content only when expanded to prevent overlapping overlays  */}
                {(previewType !== "BlockPreview" || isExpanded) && (
                    <section
                        id={contentId}
                        aria-labelledby={headlineId}
                        className={clsx(styles.contentWrapper, isExpanded && styles["contentWrapper--expanded"])}
                    >
                        <div className={styles.contentWrapperInner}>{content}</div>
                    </section>
                )}
            </>
        );
    },
    { label: "AccordionItem" },
);
