"use client";
import {
    hasTipTapRichTextContent,
    PreviewSkeleton,
    type PropsWithData,
    renderTipTapRichText,
    type TipTapMarkHandler,
    type TipTapNode,
    type TipTapNodeHandler,
    withPreview,
} from "@dextinity/site-nextjs";
import type { LinkBlockData, TipTapTableBlockData } from "@src/blocks.generated";
import { PageLayout } from "@src/layout/PageLayout";
import clsx from "clsx";

import { Typography, type TypographyProps } from "../components/Typography";
import { isValidLink } from "../helpers/HiddenIfInvalidLink";
import { LinkBlock } from "./LinkBlock";
import styles from "./TipTapTableBlock.module.scss";

type TypographyVariant = TypographyProps<"p">["variant"];

const nodeMapping: Record<string, TipTapNodeHandler> = {
    table: ({ children }) => (
        <table className={styles.table}>
            <tbody>{children}</tbody>
        </table>
    ),
    tableRow: ({ children }) => <tr className={styles.row}>{children}</tr>,
    tableHeader: ({ node, children }) => (
        <th
            className={clsx(styles.cell, styles["cell--highlighted"])}
            colSpan={(node.attrs?.colspan as number | undefined) ?? undefined}
            rowSpan={(node.attrs?.rowspan as number | undefined) ?? undefined}
            scope="col"
        >
            <div className={styles["cell__content"]}>{children}</div>
        </th>
    ),
    tableCell: ({ node, children }) => (
        <td
            className={styles.cell}
            colSpan={(node.attrs?.colspan as number | undefined) ?? undefined}
            rowSpan={(node.attrs?.rowspan as number | undefined) ?? undefined}
        >
            <div className={styles["cell__content"]}>{children}</div>
        </td>
    ),
    paragraph: ({ node, children }) => (
        <Typography variant={(node.attrs?.textBlockStyle as TypographyVariant | null) ?? undefined} className={styles.text}>
            {children}
        </Typography>
    ),
};

const markMapping: Record<string, TipTapMarkHandler> = {
    link: ({ mark, children }) => {
        const linkData = mark.attrs?.data as LinkBlockData | undefined;
        if (!linkData || !isValidLink(linkData)) {
            return <>{children}</>;
        }
        return <LinkBlock data={linkData}>{children}</LinkBlock>;
    },
};

export const TipTapTableBlock = withPreview(
    ({ data }: PropsWithData<TipTapTableBlockData>) => {
        const content = data.tipTapContent as TipTapNode;

        return (
            <PageLayout grid>
                <div className={styles.pageLayoutContent}>
                    <PreviewSkeleton title="Table" type="rows" hasContent={hasTipTapRichTextContent(content)}>
                        {renderTipTapRichText({ content, nodeMapping, markMapping })}
                    </PreviewSkeleton>
                </div>
            </PageLayout>
        );
    },
    { label: "TipTap Table" },
);
