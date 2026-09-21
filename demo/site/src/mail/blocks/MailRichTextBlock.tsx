import { createRichTextBlock, MjmlColumn, MjmlSection, type PropsWithData } from "@dextinity/mail-react";
import type { PhoneLinkBlockData, RichTextBlockData } from "@src/blocks.generated";

const { MjmlRichTextBlock } = createRichTextBlock({
    blockTypes: {
        title: { variant: "title" },
        header: { variant: "header" },
        copy: { variant: "copy" },
    },
    linkTypes: {
        phone: (props: PhoneLinkBlockData) => (props.phone ? `tel:${props.phone}` : undefined),
    },
});

export const MailRichTextBlock = ({ data }: PropsWithData<RichTextBlockData>) => {
    return (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlRichTextBlock data={data} />
            </MjmlColumn>
        </MjmlSection>
    );
};
