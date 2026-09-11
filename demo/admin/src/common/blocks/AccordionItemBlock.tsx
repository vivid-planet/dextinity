import { SwitchField } from "@dextinity/admin";
import {
    BlockCategory,
    BlocksFinalForm,
    createBlocksBlock,
    createCompositeBlock,
    createCompositeBlockField,
    createCompositeBlockSelectField,
    createCompositeBlockTextField,
} from "@dextinity/cms-admin";
import type { AccordionItemBlockData } from "@src/blocks.generated";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { SpaceBlock } from "@src/common/blocks/SpaceBlock";
import { StandaloneCallToActionListBlock } from "@src/common/blocks/StandaloneCallToActionListBlock";
import { FormattedMessage } from "react-intl";

import { StandaloneHeadingBlock } from "./StandaloneHeadingBlock";
import { TextImageBlock } from "./TextImageBlock";

const AccordionContentBlock = createBlocksBlock({
    name: "AccordionContent",
    supportedBlocks: {
        richtext: RichTextBlock,
        space: SpaceBlock,
        heading: StandaloneHeadingBlock,
        callToActionList: StandaloneCallToActionListBlock,
        textImage: TextImageBlock,
    },
});

export const AccordionItemBlock = createCompositeBlock(
    {
        name: "AccordionItem",
        displayName: <FormattedMessage id="accordionBlock.accordionItem.displayName" defaultMessage="Accordion Item" />,
        blocks: {
            title: {
                block: createCompositeBlockTextField({
                    label: <FormattedMessage id="accordionBlock.accordionItem.title" defaultMessage="Title" />,
                }),
                hiddenInSubroute: true,
            },
            titleHtmlTag: {
                block: createCompositeBlockSelectField<AccordionItemBlockData["titleHtmlTag"]>({
                    label: <FormattedMessage id="accordionItem.titleHtmlTag" defaultMessage="Title HTML tag" />,
                    defaultValue: "h3",
                    options: ([1, 2, 3, 4, 5, 6] as const).map((level) => ({
                        value: `h${level}`,
                        label: <FormattedMessage id="accordionItem.headline" defaultMessage="Headline {level}" values={{ level }} />,
                    })),
                    required: true,
                }),
                hiddenInSubroute: true,
            },
            content: {
                block: AccordionContentBlock,
                title: <FormattedMessage id="accordionBlock.accordionItem.content" defaultMessage="Content" />,
            },
            openByDefault: {
                block: createCompositeBlockField<AccordionItemBlockData["openByDefault"]>({
                    defaultValue: false,
                    AdminComponent: ({ state, updateState }) => {
                        return (
                            <BlocksFinalForm<{ openByDefault: typeof state }>
                                onSubmit={({ openByDefault }) => updateState(openByDefault)}
                                initialValues={{ openByDefault: state }}
                            >
                                <SwitchField
                                    name="openByDefault"
                                    label={<FormattedMessage id="accordionBlock.accordionItem.openByDefault" defaultMessage="Open by default" />}
                                />
                            </BlocksFinalForm>
                        );
                    },
                }),
                hiddenInSubroute: true,
            },
        },
    },
    (block) => {
        block.category = BlockCategory.TextAndContent;
        block.previewContent = (state) => (state.title !== undefined ? [{ type: "text", content: state.title }] : []);
        return block;
    },
);
