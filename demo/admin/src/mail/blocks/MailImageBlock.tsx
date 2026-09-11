import { BlockCategory, createCompositeBlock, createCompositeBlockSwitchField, PixelImageBlock } from "@dextinity/cms-admin";
import { FormattedMessage } from "react-intl";

export const MailImageBlock = createCompositeBlock({
    name: "MailImage",
    displayName: <FormattedMessage id="mail.imageBlock.displayName" defaultMessage="Image" />,
    category: BlockCategory.Media,
    blocks: {
        image: {
            block: PixelImageBlock,
            title: <FormattedMessage id="mail.imageBlock.image" defaultMessage="Image" />,
        },
        fullWidth: {
            block: createCompositeBlockSwitchField({
                label: <FormattedMessage id="mail.imageBlock.fullWidth" defaultMessage="Full width" />,
                defaultValue: false,
            }),
            paper: true,
        },
    },
});
