import { BlockCategory, createCompositeBlock, createCompositeBlockTextField, SvgImageBlock } from "@dextinity/cms-admin";
import { InlineRichTextBlock } from "@src/common/blocks/InlineRichTextBlock";
import { FormattedMessage } from "react-intl";

export const KeyFactsItemBlock = createCompositeBlock(
    {
        name: "KeyFactsItem",
        displayName: <FormattedMessage id="keyFactsItemBlock.displayName" defaultMessage="Key Fact" />,
        blocks: {
            icon: {
                block: SvgImageBlock,
                title: <FormattedMessage id="keyFactsItemBlock.icon" defaultMessage="Icon" />,
            },
            fact: {
                block: createCompositeBlockTextField({
                    label: <FormattedMessage id="keyFactsItemBlock.fact" defaultMessage="Fact" />,
                }),
            },
            label: {
                block: createCompositeBlockTextField({
                    label: <FormattedMessage id="keyFactsItemBlock.label" defaultMessage="Label" />,
                }),
            },
            description: {
                block: InlineRichTextBlock,
                title: <FormattedMessage id="keyFactsItemBlock.description" defaultMessage="Description" />,
            },
        },
    },
    (block) => {
        block.category = BlockCategory.TextAndContent;
        block.previewContent = (state) => [{ type: "text", content: state.fact }];
        return block;
    },
);
