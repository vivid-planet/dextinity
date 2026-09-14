import {
    BlockCategory,
    createCompositeBlock,
    createCompositeBlockSelectField,
    createCompositeBlockTextField,
    createRichTextBlock,
} from "@dextinity/cms-admin";
import type { TeaserItemBlockData } from "@src/blocks.generated";
import { LinkBlock } from "@src/common/blocks/LinkBlock";
import { MediaBlock } from "@src/common/blocks/MediaBlock";
import { TextLinkBlock } from "@src/common/blocks/TextLinkBlock";
import { FormattedMessage } from "react-intl";

const DescriptionRichTextBlock = createRichTextBlock({
    link: LinkBlock,
    rte: {
        maxBlocks: 1,
        supports: ["bold", "italic", "sub", "sup", "non-breaking-space", "soft-hyphen"],
    },
    minHeight: 0,
});

export const TeaserItemBlock = createCompositeBlock(
    {
        name: "TeaserItem",
        displayName: <FormattedMessage id="teaserItemBlock.displayName" defaultMessage="Teaser Item" />,
        blocks: {
            media: {
                block: MediaBlock,
                title: <FormattedMessage id="teaserItemBlock.media" defaultMessage="Media" />,
            },
            title: {
                block: createCompositeBlockTextField({
                    label: <FormattedMessage id="teaserItemBlock.title" defaultMessage="Title" />,
                }),
            },
            titleHtmlTag: {
                block: createCompositeBlockSelectField<TeaserItemBlockData["titleHtmlTag"]>({
                    label: <FormattedMessage id="teaserItemBlock.titleHtmlTag" defaultMessage="Title HTML tag" />,
                    defaultValue: "h3",
                    options: ([1, 2, 3, 4, 5, 6] as const).map((level) => ({
                        value: `h${level}`,
                        label: <FormattedMessage id="teaserItemBlock.headline" defaultMessage="Headline {level}" values={{ level }} />,
                    })),
                    required: true,
                }),
            },
            description: {
                block: DescriptionRichTextBlock,
                title: <FormattedMessage id="teaserItemBlock.description" defaultMessage="Description" />,
            },
            link: {
                block: TextLinkBlock,
            },
        },
    },
    (block) => {
        block.category = BlockCategory.Teaser;
        block.previewContent = (state) => [{ type: "text", content: state.title }];
        return block;
    },
);
