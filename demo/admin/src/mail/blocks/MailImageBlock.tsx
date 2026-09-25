import {
    BlockCategory,
    createCompositeBlock,
    createCompositeBlockSelectField,
    createCompositeBlockSwitchField,
    PixelImageBlock,
} from "@dextinity/cms-admin";
import type { MailImageBlockData } from "@src/blocks.generated";
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
        aspectRatio: {
            block: createCompositeBlockSelectField<MailImageBlockData["aspectRatio"]>({
                label: <FormattedMessage id="mail.imageBlock.aspectRatio" defaultMessage="Aspect ratio" />,
                defaultValue: "16x9",
                required: true,
                options: [
                    { value: "21x9", label: "21:9" },
                    { value: "16x9", label: "16:9" },
                    { value: "4x3", label: "4:3" },
                    { value: "2x1", label: "2:1" },
                    { value: "1x1", label: "1:1" },
                    { value: "3x4", label: "3:4" },
                ],
            }),
        },
    },
});
