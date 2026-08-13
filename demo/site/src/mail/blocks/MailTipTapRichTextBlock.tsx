import { createTipTapRichTextBlock, MjmlColumn, MjmlSection, type PropsWithData } from "@dextinity/mail-react";
import type { MailTipTapRichTextBlockData, PhoneLinkBlockData } from "@src/blocks.generated";

const { MjmlTipTapRichTextBlock } = createTipTapRichTextBlock({
    textBlockStyles: {
        title: { variant: "title" },
        header: { variant: "header" },
    },
    linkTypes: {
        phone: (props: PhoneLinkBlockData) => (props.phone ? `tel:${props.phone}` : undefined),
    },
});

export const MailTipTapRichTextBlock = ({ data }: PropsWithData<MailTipTapRichTextBlockData>) => {
    return (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlTipTapRichTextBlock data={data} />
            </MjmlColumn>
        </MjmlSection>
    );
};
