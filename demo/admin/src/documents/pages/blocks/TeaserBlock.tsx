import { createListBlock } from "@dextinity/cms-admin";
import { TeaserItemBlock } from "@src/documents/pages/blocks/TeaserItemBlock";
import { FormattedMessage } from "react-intl";

export const TeaserBlock = createListBlock({
    name: "Teaser",
    displayName: <FormattedMessage id="teaserBlock.displayName" defaultMessage="Teaser" />,
    iconName: "story",
    description: <FormattedMessage id="teaserBlock.description" defaultMessage="Teasers with image, title, text and link" />,
    block: TeaserItemBlock,
    itemName: <FormattedMessage id="teaserItemsBlock.itemName" defaultMessage="item" />,
    itemsName: <FormattedMessage id="teaserItemsBlock.itemsName" defaultMessage="items" />,
});
