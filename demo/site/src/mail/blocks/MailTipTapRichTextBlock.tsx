import { createTipTapRichTextBlock, MjmlColumn, MjmlSection, type PropsWithData, withPreview } from "@dextinity/mail-react";
import type { MailTipTapRichTextBlockData, PhoneLinkBlockData } from "@src/blocks.generated";

const { MjmlTipTapRichTextBlock } = createTipTapRichTextBlock({
    textBlockStyles: {
        title: { variant: "title" },
        header: { variant: "header" },
        small: { variant: "copySmall" },
    },
    linkTypes: {
        phone: (props: PhoneLinkBlockData) => (props.phone ? `tel:${props.phone}` : undefined),
    },
});

export const MailTipTapRichTextBlock = withPreview<PropsWithData<MailTipTapRichTextBlockData>>(
    ({ data, className }) => {
        return (
            <MjmlSection indent className={className}>
                <MjmlColumn>
                    <MjmlTipTapRichTextBlock data={data} />
                </MjmlColumn>
            </MjmlSection>
        );
    },
    { label: "Text" },
);
