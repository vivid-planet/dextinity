import { BlockCategory, createCompositeBlock, createCompositeBlockSelectField } from "@dextinity/cms-admin";
import type { CallToActionBlockData } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

import { TextLinkBlock } from "./TextLinkBlock";

export const CallToActionBlock = createCompositeBlock(
    {
        name: "CallToAction",
        displayName: <FormattedMessage id="callToActionBlock.displayName" defaultMessage="Call To Action" />,
        blocks: {
            textLink: {
                block: TextLinkBlock,
                title: <FormattedMessage id="callToActionBlock.link.displayName" defaultMessage="Link" />,
            },
            variant: {
                block: createCompositeBlockSelectField<CallToActionBlockData["variant"]>({
                    label: <FormattedMessage id="callToActionBlock.variant" defaultMessage="Variant" />,
                    defaultValue: "contained",
                    options: [
                        { value: "contained", label: <FormattedMessage id="callToActionBlock.variant.contained" defaultMessage="Contained" /> },
                        { value: "outlined", label: <FormattedMessage id="callToActionBlock.variant.outlined" defaultMessage="Outlined" /> },
                        { value: "text", label: <FormattedMessage id="callToActionBlock.variant.text" defaultMessage="Text" /> },
                    ],
                }),
            },
        },
    },
    (block) => {
        block.category = BlockCategory.Navigation;
        return block;
    },
);
