import { createTipTapRichTextBlock } from "@dextinity/cms-admin";
import { Typography } from "@mui/material";
import { MailLinkBlock } from "@src/mail/blocks/MailLinkBlock";
import type { HTMLAttributes } from "react";
import { FormattedMessage } from "react-intl";

export const MailTwoListSizesTipTapRichTextBlock = {
    ...createTipTapRichTextBlock({
        link: MailLinkBlock,
        textBlocks: [
            {
                name: "paragraph",
                label: <FormattedMessage id="mail.twoListSizesTipTapRichText.textBlock.paragraph" defaultMessage="Paragraph" />,
                tag: "p",
            },
        ],
        textBlockStyles: [
            {
                name: "small",
                label: <FormattedMessage id="mail.twoListSizesTipTapRichText.textBlockStyle.small" defaultMessage="Small" />,
                appliesTo: ["paragraph", "unordered-list", "ordered-list"],
                element: (props: HTMLAttributes<HTMLElement>) => <Typography variant="body2" {...props} />,
            },
        ],
    }),
    displayName: <FormattedMessage id="mail.twoListSizesTipTapRichText.displayName" defaultMessage="Rich Text (TipTap, Two List Sizes)" />,
};
