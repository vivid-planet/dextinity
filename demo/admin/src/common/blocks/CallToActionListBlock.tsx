import { createListBlock } from "@dextinity/cms-admin";
import { CallToActionBlock } from "@src/common/blocks/CallToActionBlock";
import { FormattedMessage } from "react-intl";

export const CallToActionListBlock = createListBlock({
    name: "CallToActionList",
    displayName: <FormattedMessage id="callToActionListBlock.displayName" defaultMessage="Call To Action List" />,
    iconName: "button-tap",
    description: <FormattedMessage id="callToActionListBlock.description" defaultMessage="Buttons that link to pages or websites" />,
    block: CallToActionBlock,
    itemName: <FormattedMessage id="callToActionListBlock.itemName" defaultMessage="action" />,
    itemsName: <FormattedMessage id="callToActionListBlock.itemsName" defaultMessage="actions" />,
});
