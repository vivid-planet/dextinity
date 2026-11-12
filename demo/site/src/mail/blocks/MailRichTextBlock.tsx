import { createTipTapRichTextBlock, MjmlColumn, MjmlSection, type PropsWithData, withPreview } from "@dextinity/mail-react";
import type { MailRichTextBlockData, PhoneLinkBlockData } from "@src/blocks.generated";

export const { MjmlTipTapRichTextBlock } = createTipTapRichTextBlock({
    textBlockStyles: {
        title: { variant: "title" },
        header: { variant: "header" },
        small: { variant: "copySmall" },
    },
    linkTypes: {
        phone: (props: PhoneLinkBlockData) => (props.phone ? `tel:${props.phone}` : undefined),
    },
});

export const MailRichTextBlock = withPreview<PropsWithData<MailRichTextBlockData>>(
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
