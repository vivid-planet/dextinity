import { createRichTextBlock, css, MjmlColumn, MjmlSection, type PropsWithData, registerStyles } from "@dextinity/mail-react";
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

// The theme's `list` spacing applies to every list, so this rule changes the small variant only.
// `inline` writes the padding into each cell's `style` attribute, which Outlook needs, and overrides the cell's own value.
registerStyles(
    css`
        .richTextBlock__list--variantCopySmall .richTextBlock__listItem--itemSpacing > td {
            padding-bottom: 4px !important;
        }

        .richTextBlock__list--variantCopySmall .richTextBlock__listItemMarker {
            padding-right: 8px !important;
        }
    `,
    { inline: true },
);

export const MailTwoListSizesRichTextBlock = ({ data }: PropsWithData<MailTwoListSizesRichTextBlockData>) => {
    return (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRichTextBlock data={data} />
            </MjmlColumn>
        </MjmlSection>
    );
};
