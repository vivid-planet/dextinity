import { createListBlock } from "@dextinity/cms-admin";
import { AccordionItemBlock } from "@src/common/blocks/AccordionItemBlock";
import { FormattedMessage } from "react-intl";

export const AccordionBlock = createListBlock({
    name: "Accordion",
    displayName: <FormattedMessage id="accordionBlock.displayName" defaultMessage="Accordion" />,
    iconName: "tree-expand-all",
    description: <FormattedMessage id="accordionBlock.description" defaultMessage="Sections that open and close" />,
    block: AccordionItemBlock,
    itemName: <FormattedMessage id="accordionBlock.itemName" defaultMessage="accordion item" />,
    itemsName: <FormattedMessage id="accordionBlock.itemsName" defaultMessage="accordion items" />,
});
