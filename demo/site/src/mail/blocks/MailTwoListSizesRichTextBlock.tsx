import "./smallListStyles";

import { createRichTextBlock, MjmlColumn, MjmlSection, type PropsWithData } from "@dextinity/mail-react";
import type { MailTwoListSizesRichTextBlockData, PhoneLinkBlockData } from "@src/blocks.generated";

const { MjmlRichTextBlock } = createRichTextBlock({
    blockTypes: {
        copy: { variant: "copy" },
        "copy-small": { variant: "copySmall" },
        "unordered-list-item": { variant: "copy" },
        "ordered-list-item": { variant: "copy" },
        "unordered-list-item-small": { variant: "copySmall", list: "unordered" },
        "ordered-list-item-small": { variant: "copySmall", list: "ordered" },
    },
    linkTypes: {
        phone: (props: PhoneLinkBlockData) => (props.phone ? `tel:${props.phone}` : undefined),
    },
});

export const MailTwoListSizesRichTextBlock = ({ data }: PropsWithData<MailTwoListSizesRichTextBlockData>) => {
    return (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRichTextBlock data={data} />
            </MjmlColumn>
        </MjmlSection>
    );
};
