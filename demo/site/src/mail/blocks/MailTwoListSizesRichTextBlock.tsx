import "./smallListStyles";

import { createTipTapRichTextBlock, MjmlColumn, MjmlSection, type PropsWithData, withPreview } from "@dextinity/mail-react";
import type { MailTwoListSizesRichTextBlockData, PhoneLinkBlockData } from "@src/blocks.generated";

const { MjmlTipTapRichTextBlock } = createTipTapRichTextBlock({
    textBlockStyles: {
        small: { variant: "copySmall" },
    },
    linkTypes: {
        phone: (props: PhoneLinkBlockData) => (props.phone ? `tel:${props.phone}` : undefined),
    },
});

export const MailTwoListSizesRichTextBlock = withPreview<PropsWithData<MailTwoListSizesRichTextBlockData>>(
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
