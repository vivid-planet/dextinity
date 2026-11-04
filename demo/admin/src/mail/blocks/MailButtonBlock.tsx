import {
    BlockCategory,
    createCompositeBlock,
    createCompositeBlockSelectField,
    createCompositeBlockTextField,
    ExternalLinkBlock,
} from "@dextinity/cms-admin";
import type { MailButtonBlockData } from "@src/blocks.generated";
import { FormattedMessage } from "react-intl";

export const MailButtonBlock = createCompositeBlock({
    name: "MailButton",
    displayName: <FormattedMessage id="mail.buttonBlock.displayName" defaultMessage="Button" />,
    category: BlockCategory.Navigation,
    blocks: {
        text: {
            block: createCompositeBlockTextField({
                label: <FormattedMessage id="mail.buttonBlock.text" defaultMessage="Text" />,
            }),
        },
        link: {
            block: ExternalLinkBlock,
            title: <FormattedMessage id="mail.buttonBlock.link" defaultMessage="Link" />,
            paper: true,
        },
        variant: {
            block: createCompositeBlockSelectField<MailButtonBlockData["variant"]>({
                label: <FormattedMessage id="mail.buttonBlock.variant" defaultMessage="Variant" />,
                defaultValue: "filled",
                required: true,
                options: [
                    { value: "filled", label: <FormattedMessage id="mail.buttonBlock.variant.filled" defaultMessage="Filled" /> },
                    { value: "outlined", label: <FormattedMessage id="mail.buttonBlock.variant.outlined" defaultMessage="Outlined" /> },
                ],
            }),
        },
        align: {
            block: createCompositeBlockSelectField<MailButtonBlockData["align"]>({
                label: <FormattedMessage id="mail.buttonBlock.align" defaultMessage="Alignment" />,
                defaultValue: "left",
                required: true,
                options: [
                    { value: "left", label: <FormattedMessage id="mail.buttonBlock.align.left" defaultMessage="Left" /> },
                    { value: "center", label: <FormattedMessage id="mail.buttonBlock.align.center" defaultMessage="Center" /> },
                    { value: "right", label: <FormattedMessage id="mail.buttonBlock.align.right" defaultMessage="Right" /> },
                ],
            }),
        },
    },
});
