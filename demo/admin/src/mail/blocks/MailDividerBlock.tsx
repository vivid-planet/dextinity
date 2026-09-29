import { BlockCategory, createCompositeBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

export const MailDividerBlock = createCompositeBlock({
    name: "MailDivider",
    displayName: <FormattedMessage id="mail.dividerBlock.displayName" defaultMessage="Divider" />,
    category: BlockCategory.Layout,
    blocks: {},
});
