import { BlocksBlock, type PropsWithData, type SupportedBlocks, usePreview, withPreview } from "@dextinity/site-nextjs";
import type { AccordionContentBlockData, AccordionItemBlockData } from "@src/blocks.generated";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { SpaceBlock } from "@src/common/blocks/SpaceBlock";
import { StandaloneCallToActionListBlock } from "@src/common/blocks/StandaloneCallToActionListBlock";
import { StandaloneHeadingBlock } from "@src/common/blocks/StandaloneHeadingBlock";
import clsx from "clsx";
import { useId } from "react";

import { Typography } from "../components/Typography";
import { SvgUse } from "../helpers/SvgUse";
import styles from "./AccordionItemBlock.module.scss";
import { TextImageBlock } from "./TextImageBlock";

const supportedBlocks: SupportedBlocks = {
    richtext: (props) => <RichTextBlock data={props} />,
    heading: (props) => <StandaloneHeadingBlock data={props} />,
    space: (props) => <SpaceBlock data={props} />,
    callToActionList: (props) => <StandaloneCallToActionListBlock data={props} />,
    textImage: (props) => <TextImageBlock data={props} />,
};

const AccordionContentBlock = withPreview(
    ({ data: { blocks } }: PropsWithData<AccordionContentBlockData>) => {
        return <BlocksBlock data={{ blocks }} supportedBlocks={supportedBlocks} />;
    },
    { label: "Accordion Content" },
);

type AccordionItemBlockProps = PropsWithData<AccordionItemBlockData> & {
    isExpanded: boolean;
    onChange: () => void;
};

export const AccordionItemBlock = withPreview(
    ({ data: { title, content, titleHtmlTag }, isExpanded, onChange }: AccordionItemBlockProps) => {
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
                        <div className={styles.contentWrapperInner}>
                            <AccordionContentBlock data={content} />
                        </div>
                    </section>
                )}
            </>
        );
    },
    { label: "AccordionItem" },
);
