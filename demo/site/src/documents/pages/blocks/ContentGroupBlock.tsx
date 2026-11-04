import { BlocksBlock, type PropsWithData, type SupportedBlocks, withPreview } from "@dextinity/site-nextjs";
import type { ContentGroupBlockData, ContentGroupContentBlockData } from "@src/blocks.generated";
import { PageContentAccordionBlock } from "@src/common/blocks/AccordionBlock";
import { AnchorBlock } from "@src/common/blocks/AnchorBlock";
import { PageContentMediaGalleryBlock } from "@src/common/blocks/MediaGalleryBlock";
import { SpaceBlock } from "@src/common/blocks/SpaceBlock";
import { PageContentStandaloneCallToActionListBlock } from "@src/common/blocks/StandaloneCallToActionListBlock";
import { PageContentStandaloneHeadingBlock } from "@src/common/blocks/StandaloneHeadingBlock";
import { StandaloneMediaBlock } from "@src/common/blocks/StandaloneMediaBlock";
import { PageContentStandaloneRichTextBlock } from "@src/common/blocks/StandaloneRichTextBlock";
import { TableBlock } from "@src/common/blocks/TableBlock";
import { TipTapTableBlock } from "@src/common/blocks/TipTapTableBlock";
import { ColumnsBlock } from "@src/documents/pages/blocks/ColumnsBlock";
import { KeyFactsBlock } from "@src/documents/pages/blocks/KeyFactsBlock";
import { TeaserBlock } from "@src/documents/pages/blocks/TeaserBlock";
import { PageLayout } from "@src/layout/PageLayout";
import clsx from "clsx";

import styles from "./ContentGroupBlock.module.scss";

const supportedBlocks: SupportedBlocks = {
    accordion: (props) => <PageContentAccordionBlock data={props} />,
    anchor: (props) => <AnchorBlock data={props} />,
    space: (props) => <SpaceBlock data={props} />,
    teaser: (props) => <TeaserBlock data={props} />,
    richtext: (props) => <PageContentStandaloneRichTextBlock data={props} />,
    heading: (props) => <PageContentStandaloneHeadingBlock data={props} />,
    columns: (props) => <ColumnsBlock data={props} />,
    callToActionList: (props) => <PageContentStandaloneCallToActionListBlock data={props} />,
    keyFacts: (props) => <KeyFactsBlock data={props} />,
    media: (props) => <StandaloneMediaBlock data={props} />,
    mediaGallery: (props) => <PageContentMediaGalleryBlock data={props} />,
    table: (props) => <TableBlock data={props} />,
    tipTapTable: (props) => <TipTapTableBlock data={props} />,
};

const ContentGroupContentBlock = withPreview(
    ({ data }: PropsWithData<ContentGroupContentBlockData>) => {
        return <BlocksBlock data={data} supportedBlocks={supportedBlocks} />;
    },
    { label: "ContentGroupContent" },
);

export const ContentGroupBlock = withPreview(
    ({ data: { content, backgroundColor } }: PropsWithData<ContentGroupBlockData>) => {
        return (
            <PageLayout className={clsx(styles.root, backgroundColor !== "default" ? styles[`root--${backgroundColor}`] : undefined)}>
                <ContentGroupContentBlock data={content} />
            </PageLayout>
        );
    },
    { label: "ContentGroup" },
);
