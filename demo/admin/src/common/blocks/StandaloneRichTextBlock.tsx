import { BlockCategory, createCompositeBlock, createCompositeBlockSelectField } from "@dextinity/cms-admin";
import type { StandaloneRichTextBlockData } from "@src/blocks.generated";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { FormattedMessage } from "react-intl";

export const StandaloneRichTextBlock = createCompositeBlock(
    {
        name: "StandaloneRichText",
        displayName: RichTextBlock.displayName,
        blocks: {
            richText: {
                block: RichTextBlock,
            },
            textAlignment: {
                block: createCompositeBlockSelectField<StandaloneRichTextBlockData["textAlignment"]>({
                    label: <FormattedMessage id="standaloneRichText.textAlignment" defaultMessage="Text alignment" />,
                    defaultValue: "left",
                    options: [
                        { value: "left", label: <FormattedMessage id="standaloneRichText.textAlignment.left" defaultMessage="left" /> },
                        { value: "center", label: <FormattedMessage id="standaloneRichText.textAlignment.center" defaultMessage="center" /> },
                        { value: "right", label: <FormattedMessage id="standaloneRichText.textAlignment.right" defaultMessage="right" /> },
                        { value: "justify", label: <FormattedMessage id="standaloneRichText.textAlignment.justify" defaultMessage="justify" /> },
                    ],
                }),
            },
        },
    },
    (block) => {
        block.category = BlockCategory.TextAndContent;
        return block;
    },
);
