import { createCompositeBlock, createCompositeBlockTextField, DamImageBlock } from "@dextinity/cms-admin";
import { LinkListBlock } from "@src/common/blocks/LinkListBlock";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { FormattedMessage } from "react-intl";

export const FooterContentBlock = createCompositeBlock({
    name: "FooterContent",
    displayName: null,
    blocks: {
        text: {
            block: RichTextBlock,
            title: <FormattedMessage id="footers.blocks.text" defaultMessage="Text" />,
            hiddenInSubroute: true,
        },
        image: {
            block: DamImageBlock,
            title: <FormattedMessage id="footers.blocks.image" defaultMessage="Image" />,
            hiddenInSubroute: true,
        },
        caption: {
            block: createCompositeBlockTextField({
                label: <FormattedMessage id="footers.blocks.caption" defaultMessage="Caption" />,
            }),
            hiddenInSubroute: true,
        },
        linkList: {
            block: LinkListBlock,
            title: <FormattedMessage id="footers.blocks.content.links" defaultMessage="Links" />,
        },
        copyrightNotice: {
            block: createCompositeBlockTextField({
                label: <FormattedMessage id="footers.blocks.content.copyrightNotice" defaultMessage="Copyright notice" />,
            }),
            hiddenInSubroute: true,
        },
    },
});
