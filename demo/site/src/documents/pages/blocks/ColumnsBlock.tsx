import { BlocksBlock, type PropsWithData, type SupportedBlocks, withPreview } from "@dextinity/site-nextjs";
import type { ColumnsBlockData, ColumnsContentBlockData } from "@src/blocks.generated";
import { AccordionBlock } from "@src/common/blocks/AccordionBlock";
import { AnchorBlock } from "@src/common/blocks/AnchorBlock";
import { MediaGalleryBlock } from "@src/common/blocks/MediaGalleryBlock";
import { SpaceBlock } from "@src/common/blocks/SpaceBlock";
import { StandaloneCallToActionListBlock } from "@src/common/blocks/StandaloneCallToActionListBlock";
import { StandaloneHeadingBlock } from "@src/common/blocks/StandaloneHeadingBlock";
import { StandaloneMediaBlock } from "@src/common/blocks/StandaloneMediaBlock";
import { StandaloneRichTextBlock } from "@src/common/blocks/StandaloneRichTextBlock";
import { TextImageBlock } from "@src/common/blocks/TextImageBlock";
import { PageLayout } from "@src/layout/PageLayout";
import clsx from "clsx";

import styles from "./ColumnsBlock.module.scss";

const supportedBlocks: SupportedBlocks = {
    accordion: (props) => <AccordionBlock data={props} />,
    anchor: (props) => <AnchorBlock data={props} />,
    richtext: (props) => <StandaloneRichTextBlock data={props} />,
    space: (props) => <SpaceBlock data={props} />,
    heading: (props) => <StandaloneHeadingBlock data={props} />,
    callToActionList: (props) => <StandaloneCallToActionListBlock data={props} />,
    media: (props) => <StandaloneMediaBlock data={props} />,
    mediaGallery: (props) => <MediaGalleryBlock data={props} />,
    textImage: (props) => <TextImageBlock data={props} />,
};

const ColumnsContentBlock = withPreview(
    ({ data }: PropsWithData<ColumnsContentBlockData>) => {
        return <BlocksBlock data={data} supportedBlocks={supportedBlocks} />;
    },
    { label: "Columns" },
);

const layoutToStyleMap: { [key: string]: string } = {
    "6-12-6": styles["layout-6-12-6"],
    "4-16-4": styles["layout-4-16-4"],
    "9-9": styles["layout-9-9"],
    "12-6": styles["layout-12-6"],
    "6-12": styles["layout-6-12"],
};

export const ColumnsBlock = withPreview(
    ({ data: { columns, layout } }: PropsWithData<ColumnsBlockData>) => (
        <PageLayout grid>
            {columns.map((column) => (
                <div className={clsx(styles.column, layoutToStyleMap[layout])} key={column.key}>
                    <ColumnsContentBlock data={column.props} />
                </div>
            ))}
        </PageLayout>
    ),
    { label: "Columns" },
);
