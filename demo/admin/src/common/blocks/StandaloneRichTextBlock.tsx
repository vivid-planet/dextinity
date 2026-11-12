import { BlockCategory, createCompositeBlock, createCompositeBlockSelectField } from "@dextinity/cms-admin";
import type { StandaloneRichTextBlockData } from "@src/blocks.generated";
import { TipTapRichTextBlock } from "@src/common/blocks/TipTapRichTextBlock";
import { FormattedMessage } from "react-intl";

export const StandaloneRichTextBlock = createCompositeBlock(
    {
        name: "StandaloneRichText",
        displayName: TipTapRichTextBlock.displayName,
        blocks: {
            richText: {
                block: TipTapRichTextBlock,
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
                    required: true,
                }),
            },
        },
    },
    (block) => {
        block.category = BlockCategory.TextAndContent;
        return block;
    },
);
