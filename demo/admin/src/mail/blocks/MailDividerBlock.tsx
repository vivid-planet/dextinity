import { BlockCategory, createCompositeBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

export const MailDividerBlock = createCompositeBlock({
    name: "MailDivider",
    displayName: <FormattedMessage id="mail.dividerBlock.displayName" defaultMessage="Divider" />,
    category: BlockCategory.Layout,
    iconName: "minus",
    description: <FormattedMessage id="mail.dividerBlock.description" defaultMessage="Line between blocks" />,
    blocks: {},
});
