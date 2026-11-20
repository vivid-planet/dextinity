import { createTipTapRichTextBlock, MjmlColumn, MjmlSection, type PropsWithData, withPreview } from "@dextinity/mail-react";
import type { MailHeadingBlockData } from "@src/blocks.generated";

export const { MjmlTipTapRichTextBlock: MjmlHeadingBlock } = createTipTapRichTextBlock({
    textBlocks: {
        title: { variant: "title" },
        header: { variant: "header" },
    },
});

export const MailHeadingBlock = withPreview<PropsWithData<MailHeadingBlockData>>(
    ({ data, className }) => {
        return (
            <MjmlSection indent className={className}>
                <MjmlColumn>
                    <MjmlHeadingBlock data={data} />
                </MjmlColumn>
            </MjmlSection>
        );
    },
    { label: "Heading" },
);
