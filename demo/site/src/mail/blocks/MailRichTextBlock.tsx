import { createRichTextBlock, MjmlColumn, MjmlSection, type PropsWithData, withPreview } from "@dextinity/mail-react";
import type { MailRichTextBlockData, PhoneLinkBlockData } from "@src/blocks.generated";

export const { MjmlRichTextBlock } = createRichTextBlock({
    blockTypes: {
        title: { variant: "title" },
        header: { variant: "header" },
        copy: { variant: "copy" },
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
                    <MjmlRichTextBlock data={data} />
                </MjmlColumn>
            </MjmlSection>
        );
    },
    { label: "Text" },
);
