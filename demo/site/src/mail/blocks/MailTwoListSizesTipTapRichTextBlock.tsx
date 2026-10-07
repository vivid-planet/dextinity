import "./smallListStyles";

import { createTipTapRichTextBlock, MjmlColumn, MjmlSection, type PropsWithData } from "@dextinity/mail-react";
import type { MailTwoListSizesTipTapRichTextBlockData, PhoneLinkBlockData } from "@src/blocks.generated";

const { MjmlTipTapRichTextBlock } = createTipTapRichTextBlock({
    textBlockStyles: {
        small: { variant: "copySmall" },
    },
    linkTypes: {
        phone: (props: PhoneLinkBlockData) => (props.phone ? `tel:${props.phone}` : undefined),
    },
});

export const MailTwoListSizesTipTapRichTextBlock = ({ data }: PropsWithData<MailTwoListSizesTipTapRichTextBlockData>) => {
    return (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlTipTapRichTextBlock data={data} />
            </MjmlColumn>
        </MjmlSection>
    );
};
