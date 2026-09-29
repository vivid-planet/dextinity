import { BlockCategory, createCompositeBlock, createCompositeBlockSelectField } from "@dextinity/cms-admin";
import type { MailSpacerBlockData } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

export const MailSpacerBlock = createCompositeBlock({
    name: "MailSpacer",
    displayName: <FormattedMessage id="mail.spacerBlock.displayName" defaultMessage="Spacer" />,
    category: BlockCategory.Layout,
    blocks: {
        spacing: {
            block: createCompositeBlockSelectField<MailSpacerBlockData["spacing"]>({
                label: <FormattedMessage id="mail.spacerBlock.spacing" defaultMessage="Spacing" />,
                defaultValue: "medium",
                required: true,
                options: [
                    { value: "small", label: <FormattedMessage id="mail.spacerBlock.spacing.small" defaultMessage="Small" /> },
                    { value: "medium", label: <FormattedMessage id="mail.spacerBlock.spacing.medium" defaultMessage="Medium" /> },
                    { value: "large", label: <FormattedMessage id="mail.spacerBlock.spacing.large" defaultMessage="Large" /> },
                ],
            }),
        },
    },
});
