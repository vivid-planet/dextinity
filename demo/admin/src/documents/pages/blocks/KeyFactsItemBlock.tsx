import { BlockCategory, createCompositeBlock, createCompositeBlockTextField, createRichTextBlock, SvgImageBlock } from "@dextinity/cms-admin";
import { LinkBlock } from "@src/common/blocks/LinkBlock";
import { FormattedMessage } from "react-intl";

const DescriptionRichTextBlock = createRichTextBlock({
    link: LinkBlock,
    rte: {
        maxBlocks: 1,
        supports: ["bold", "italic", "sub", "sup", "non-breaking-space", "soft-hyphen"],
    },
    minHeight: 0,
});

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
                block: DescriptionRichTextBlock,
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
