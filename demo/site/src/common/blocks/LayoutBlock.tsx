"use client";
import { type PropsWithData, withPreview } from "@dextinity/site-nextjs";
import type { LayoutBlockData } from "@src/blocks.generated";
import clsx from "clsx";

import styles from "./LayoutBlock.module.scss";
import { MediaBlock } from "./MediaBlock";
import { RichTextBlock } from "./RichTextBlock";

const layoutOptions: Array<{ name: LayoutBlockData["layout"]; blocks: string[] }> = [
    {
        name: "layout1",
        blocks: ["media1", "text1", "media2"],
    },
    {
        name: "layout2",
        blocks: ["text1", "media2", "text2"],
    },
    {
        name: "layout3",
        blocks: ["media1", "text1", "media2"],
    },
    {
        name: "layout4",
        blocks: ["media1", "text1"],
    },
    {
        name: "layout5",
        blocks: ["text1", "media1"],
    },
    {
        name: "layout6",
        blocks: ["media1", "text1"],
    },
    {
        name: "layout7",
        blocks: ["text1", "media1"],
    },
];

const LayoutBlock = withPreview(
    ({ data: { layout, media1, text1, media2, text2 } }: PropsWithData<LayoutBlockData>) => {
        const layoutVariant = layoutOptions.find((option) => option.name === layout);

        const blockForKey = (key: string) =>
            key === "media1" ? (
                <MediaBlock data={media1} aspectRatio="inherit" />
            ) : key === "text1" ? (
                <RichTextBlock data={text1} />
            ) : key === "media2" ? (
                <MediaBlock data={media2} aspectRatio="inherit" />
            ) : (
                <RichTextBlock data={text2} />
            );

        return (
            <div className={styles.root}>
                {layoutVariant?.blocks.map((key) => (
                    <div key={key} className={clsx(styles.box, styles[layoutVariant.name])}>
                        {blockForKey(key)}
                    </div>
                ))}
            </div>
        );
    },
    { label: "Columns" },
);

export { LayoutBlock };
