import { createListBlock } from "@dextinity/cms-admin";
import { AccordionItemBlock } from "@src/common/blocks/AccordionItemBlock";
import { FormattedMessage } from "react-intl";

export const AccordionBlock = createListBlock({
    name: "Accordion",
    displayName: <FormattedMessage id="accordionBlock.displayName" defaultMessage="Accordion" />,
    block: AccordionItemBlock,
    itemName: <FormattedMessage id="accordionBlock.itemName" defaultMessage="accordion item" />,
    itemsName: <FormattedMessage id="accordionBlock.itemsName" defaultMessage="accordion items" />,
});
